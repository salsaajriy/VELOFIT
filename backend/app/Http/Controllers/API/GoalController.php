<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGoalRequest;
use App\Http\Requests\UpdateGoalRequest;
use App\Models\Goal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $goals = Goal::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($goals);
    }

    public function store(
        StoreGoalRequest $request
    ): JsonResponse {

        $goal = Goal::create([
            'user_id' => $request->user()->id,
            'metric_type' => $request->metric_type,
            'period' => $request->period,
            'target_value' => $request->target_value,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Goal created successfully',
            'data' => $goal,
        ], 201);
    }

    public function update(
        UpdateGoalRequest $request,
        Goal $goal
    ): JsonResponse {

        abort_if(
            $goal->user_id !== $request->user()->id,
            403
        );

        $goal->update($request->validated());

        return response()->json([
            'message' => 'Goal updated successfully',
            'data' => $goal,
        ]);
    }

    public function destroy(
        Request $request,
        Goal $goal
    ): JsonResponse {

        abort_if(
            $goal->user_id !== $request->user()->id,
            403
        );

        $goal->delete();

        return response()->json([
            'message' => 'Goal deleted successfully',
        ]);
    }
}