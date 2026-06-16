import type { SensorPayload } from '@/types';

const SERVICE_UUID        = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

type SensorCallback = (data: SensorPayload) => void;

class BLEService {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private sensorCallback: SensorCallback | null = null;

  /**
   * Open the browser BLE device picker and connect.
   * Returns the connected device and active characteristic.
   */
  async connect(): Promise<{
    device: BluetoothDevice;
    characteristic: BluetoothRemoteGATTCharacteristic;
  }> {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth is not supported in this browser.');
    }

    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'VELOFIT' }],
      optionalServices: [SERVICE_UUID],
    });

    if (!this.device.gatt) {
      throw new Error('GATT not available on this device.');
    }

    const server  = await this.device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);
    this.characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

    // Listen for disconnect
    this.device.addEventListener('gattserverdisconnected', () => {
      console.warn('[BLE] Device disconnected');
    });

    return { device: this.device, characteristic: this.characteristic };
  }

  /**
   * Start listening to BLE notifications and invoke callback with parsed payload.
   */
  async startNotifications(callback: SensorCallback): Promise<void> {
    if (!this.characteristic) throw new Error('Not connected.');

    this.sensorCallback = callback;

    await this.characteristic.startNotifications();
    this.characteristic.addEventListener(
      'characteristicvaluechanged',
      this.handleNotification.bind(this)
    );
  }

  async stopNotifications(): Promise<void> {
    if (!this.characteristic) return;
    try {
      await this.characteristic.stopNotifications();
      this.characteristic.removeEventListener(
        'characteristicvaluechanged',
        this.handleNotification.bind(this)
      );
    } catch {
      // Device may already be disconnected
    }
  }

  /**
   * Write a command string to the characteristic (e.g. "CANCEL").
   */
  async writeCommand(cmd: string): Promise<void> {
    if (!this.characteristic) return;
    const encoder = new TextEncoder();
    await this.characteristic.writeValue(encoder.encode(cmd));
  }

  disconnect(): void {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
    this.sensorCallback = null;
  }

  isConnected(): boolean {
    return this.device?.gatt?.connected ?? false;
  }

  getDeviceName(): string | null {
    return this.device?.name ?? null;
  }

  private handleNotification(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const decoder = new TextDecoder('utf-8');
    const raw = decoder.decode(target.value as DataView);

    try {
      const parsed: SensorPayload = JSON.parse(raw);
      this.sensorCallback?.(parsed);
    } catch (err) {
      console.warn('[BLE] Failed to parse payload:', raw, err);
    }
  }
}

// Singleton — one BLE connection per browser session
export const bleService = new BLEService();