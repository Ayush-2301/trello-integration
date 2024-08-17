"use client";
import { useContext, useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import TaskForm from "./TaskForm";
import { Context } from "@/components/provider/ContextProvider";
import { Profile, Task } from "@/lib/types";
import { getSingleTask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { getProfile } from "@/lib/actions/profile";

export function EditTask({ userID }: { userID: string }) {
  const { toast } = useToast();
  const { taskID, setTaskID, openSheet, setOpenSheet } = useContext(Context);
  const [isLoading, setLoading] = useState(false);
  const [initialValue, setInitialValue] = useState<Task | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (taskID) {
      setOpenSheet(true);
      setLoading(true);
      const fetchTask = async () => {
        const task = await getSingleTask({ id: taskID });
        const profile = await getProfile();
        if ("error" in task) {
          toast({
            title: "Error fetching task",
            variant: "destructive",
          });
          setOpenSheet(false);
          setTaskID("");
        } else {
          setInitialValue(task || null);
          console.log(profile);
          setProfile(profile || null);
          setLoading(false);
        }
      };
      fetchTask();
    } else {
      setInitialValue(null);
    }
  }, [taskID]);

  const handleClose = () => {
    setOpenSheet(!openSheet);
    setTaskID("");
  };

  return (
    <Sheet open={openSheet} onOpenChange={handleClose}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-1" /> Create Task
        </Button>
      </SheetTrigger>
      <SheetTitle hidden></SheetTitle>
      <SheetDescription hidden></SheetDescription>
      <SheetContent className="min-w-[600px] w-full  ">
        {isLoading ? (
          <TaskFormSkeleton />
        ) : (
          <TaskForm
            profile={profile}
            initialData={initialValue}
            taskID={taskID}
            userID={userID}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
export function TaskFormSkeleton() {
  return (
    <div className="flex flex-col items-start py-4  space-y-8 ">
      <div className="w-full space-y-4 flex flex-col items-start">
        <Skeleton className="h-[50px] w-[300px] rounded-md" />
        <div className="flex items-start justify-center  space-x-2">
          <Skeleton className="h-[35px] w-[150px] rounded-md" />
        </div>
        <div className="flex items-start justify-center space-x-2">
          <Skeleton className="h-[35px] w-[150px] rounded-md" />
        </div>
        <div className="flex items-start justify-center space-x-2">
          <Skeleton className="h-[35px] w-[150px] rounded-md" />
        </div>
        <div className="flex items-start justify-center space-x-2">
          <Skeleton className="h-[35px] w-[150px] rounded-md" />
        </div>
        <Skeleton className="h-[200px] w-full rounded-md" />
      </div>
    </div>
  );
}
