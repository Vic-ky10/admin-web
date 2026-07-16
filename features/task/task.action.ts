"use server";

import { revalidatePath } from "next/cache";



import {
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from "./task.service";

import {
  TaskInput,
  UpdateTaskInput,
} from "./task.validation";
import { getAuthenticatedProfileId } from "../expense/expense.service";


// creactaction

export async function createTaskAction(
  values: TaskInput
) {
  const profileId = await getAuthenticatedProfileId();

if (!profileId) {
  return {
    success: false,
    error: "Unauthorized.",
  };
}



  const result = await createTask(
    profileId,
    values
  );

  revalidatePath("/tasks");
  revalidatePath("/employee/tasks");

  return result;
}

 // update action 
export async function updateTaskAction(
  id: string,
  values: UpdateTaskInput
) {
  const result = await updateTask(id, values);

  revalidatePath("/tasks");
  revalidatePath("/employee/tasks");

  return result;
}


// delete action

export async function deleteTaskAction(
  id: string
) {
  const result = await deleteTask(id);

  revalidatePath("/tasks");
  revalidatePath("/employee/tasks");

  return result;
}


export async function updateTaskStatusAction(
  id: string,
  status: string,
  actualHours?: number
) {
  const result = await updateTaskStatus(
    id,
    status,
    actualHours
  );

  revalidatePath("/tasks");
  revalidatePath("/employee/tasks");

  return result;
}