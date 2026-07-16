from locust import HttpUser, task, between
from locust.exception import StopUser
import threading
import random
import time

# ===============================
# Pool akun
# ===============================

accounts = [
    {
        "email": f"loadtest{i}@gmail.com",
        "password": "password123"
    }
    for i in range(1, 1001)
]

lock = threading.Lock()


class VelofitUser(HttpUser):

    host = "http://127.0.0.1:8000"
    wait_time = between(1, 2)

    def on_start(self):

        global accounts

        with lock:
            if not accounts:
                raise StopUser()

            self.account = accounts.pop(0)

        # ================= Login =================

        login = self.client.post(
            "/api/auth/login",
            json={
                "email": self.account["email"],
                "password": self.account["password"]
            },
            name="Login"
        )

        if login.status_code != 200:
            print(login.text)
            raise StopUser()

        token = login.json()["access_token"]

        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

        # ================= Ambil Helmet =================

        helmets = self.client.get(
            "/api/helmets",
            headers=self.headers,
            name="Get Helmet"
        )

        if helmets.status_code != 200:
            print("Gagal mengambil helmet")
            print(helmets.text)
            raise StopUser()

        data = helmets.json()["data"]

        if len(data) == 0:
            print("User tidak memiliki helmet")
            raise StopUser()

        self.helmet_id = data[0]["id"]

    @task
    def ride_session(self):

        # ================= Dashboard =================

        # self.client.get(
        #     "/api/user/dashboard",
        #     headers=self.headers,
        #     name="Dashboard"
        # )

        # ================= Start Ride =================

        start = self.client.post(
            "/api/rides/start",
            headers=self.headers,
            json={
                "helmet_id": self.helmet_id
            },
            name="Start Ride"
        )

        if start.status_code != 201:
            print(start.text)
            raise StopUser()

        ride_id = start.json()["data"]["id"]

        lat = -0.947083
        lon = 104.458889

        # ================= Sensor Data =================

        for i in range(4):

            lat += random.uniform(0.00003, 0.00008)
            lon += random.uniform(0.00003, 0.00008)

            sensor = self.client.post(
                f"/api/rides/{ride_id}/sensor-data",
                headers=self.headers,
                json={
                    "helmet_id": self.helmet_id,
                    "body": round(random.uniform(36.2, 36.9), 2),
                    "room": round(random.uniform(28.0, 31.0), 2),
                    "g": round(random.uniform(0.0, 0.2), 2),
                    "lat": lat,
                    "lon": lon,
                    "gpsOk": True,
                    "alert": 0
                },
                name="Sensor Data"
            )

            if sensor.status_code != 200:
                print(sensor.text)
                raise StopUser()

            time.sleep(0.2)

        # ================= Finish Ride =================

        finish = self.client.post(
            f"/api/rides/{ride_id}/finish",
            headers=self.headers,
            name="Finish Ride"
        )

        if finish.status_code != 200:
            print(finish.text)
            raise StopUser()

        # ================= History =================

        # self.client.get(
        #     "/api/rides/history",
        #     headers=self.headers,
        #     name="History"
        # )

        raise StopUser()