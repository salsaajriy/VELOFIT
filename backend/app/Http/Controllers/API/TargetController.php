<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\TargetRequest;
use App\Http\Resources\TargetResource;
use App\Services\TargetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TargetController extends Controller
{
    public function __construct(private TargetService $targetService) {}

    /**
     * GET /api/targets/active?type=daily
     * Get active target with progress
     */
    public function active(Request $request): JsonResponse
    {
        $request->validate(['type' => 'required|in:daily,weekly']);
        $userId = $request->user()->id;
        $type   = $request->query('type');

        $target = $this->targetService->getActive($userId, $type);

        if (! $target) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'No active target found.'
            ], 404);
        }

        $progress = $this->targetService->computeProgress($userId, $target);

        return response()->json([
            'success' => true,
            'data' => [
                ...(new TargetResource($target))->toArray($request),
                'progress' => $progress,
            ],
        ]);
    }

    public function store(TargetRequest $request): JsonResponse
    {
        $target = $this->targetService->setTarget(
            $request->user()->id,
            $request->type,
            $request->distance
        );

        return response()->json([
            'success' => true,
            'message' => 'Target saved successfully.',
            'data'    => new TargetResource($target),
        ], 201);
    }

    public function history(Request $request): JsonResponse
    {
        $history = $this->targetService->getHistory($request->user()->id);

        return response()->json([
            'success' => true,
            'data' => TargetResource::collection($history),
            'total' => $history->count(),
        ]);
    }

    public function dailyBreakdown(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 7);

        return response()->json([
            'success' => true,
            'data' => $this->targetService->dailyBreakdown($request->user()->id, $days),
        ]);
    }

    public function weeklyBreakdown(Request $request): JsonResponse
    {
        $weeks = (int) $request->query('weeks', 6);

        return response()->json([
            'success' => true,
            'data' => $this->targetService->weeklyBreakdown($request->user()->id, $weeks),
        ]);
    }

    /**
     * GET /api/targets/stats
     * Get streak and best day stats
     */
    public function stats(Request $request): JsonResponse
    {
        $request->validate(['daily_target' => 'required|numeric|min:0.1']);
        $userId = $request->user()->id;
        $dailyTarget = (float) $request->query('daily_target');

        return response()->json([
            'success' => true,
            'data' => [
                'streak'   => $this->targetService->streak($userId, $dailyTarget),
                'best_day' => $this->targetService->bestDay($userId),
            ],
        ]);
    }
}