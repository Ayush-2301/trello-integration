"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskFormSchema, type TaskForm } from "../schema";
import { useForm } from "react-hook-form";
import { AlertModal } from "@/components/modal/alert-modal";
import { Input } from "@/components/ui/custom-input";
import { Input as OriginalInput } from "@/components/ui/input";
import { TaskSelectComponent } from "./TaskSelectComponent";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { Button } from "@/components/ui/button";
import {
  Trash,
  Loader,
  LucideCirclePlay,
  UsersIcon,
  CalendarIcon,
  EllipsisVertical,
  Plus,
  Unplug,
  Info,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SheetClose } from "@/components/ui/sheet";
import type { Profile, Task } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  addTaskToTrello,
  deleteTask,
  disconnectTaskFromTrello,
  insertTask,
  updateTask,
} from "@/lib/actions/tasks";
import { Context } from "@/components/provider/ContextProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const StatusOption = [
  { label: "Not Started", value: "Not Started", color: "#adb5bd" },
  { label: "In Progress", value: "In Progress", color: "#0466c8" },
  { label: "Completed", value: "Completed", color: "#55a630" },
];
const PriorityOption = [
  {
    label: "Low",
    value: "Low",
    color: "#55a630",
  },
  {
    label: "Medium",
    value: "Medium",
    color: "#ffca3a",
  },
  {
    label: "High",
    value: "High",
    color: "#dd2d4a",
  },
];

const TaskForm = ({
  initialData,
  taskID,
  userID,
  profile,
}: {
  initialData: Task | null;
  taskID?: string;
  userID: string;
  profile: Profile | null;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { setTaskID, setOpenSheet } = useContext(Context);
  const [open, setOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const action = initialData ? "Save changes" : "Create";
  console.log(profile);
  const defaultValues: TaskForm = initialData
    ? initialData
    : {
        user_id: "",
        title: "",
        description: "",
        status: "Not Started",
        approved: false,
        priority: "Low",
        deadline: new Date(),
        assignedTo: "To Self",
        created_at: new Date(),
      };
  if (defaultValues.description === "No Description Provided") {
    defaultValues.description = "";
  }
  const form = useForm<TaskForm>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  const isLoading = form.formState.isLoading;

  async function update({
    newTask,
    taskID,
  }: {
    newTask: TaskForm;
    taskID: string;
  }) {
    const res = await updateTask({ newTask, taskID });
    if (res) {
      toast({
        title: "Task updated successfully",
      });
      router.push("/");
    }
  }
  async function insert({ newTask }: { newTask: TaskForm }) {
    const res = await insertTask({ newTask });
    if ("error" in res) {
      toast({
        title: "Error creating task",
        description: res.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Task created successfully",
      });
      router.push("/");
      router.refresh();
    }
  }
  const onSubmit = () => {
    const newTask: TaskForm = {
      user_id: userID,
      created_at: initialData ? initialData.created_at : new Date(),
      title: form.getValues("title"),
      description: form.getValues("description") || "No Description Provided",
      status: form.getValues("status") || "Not Started",
      priority: form.getValues("priority") || "Low",
      approved: false,
      deadline: form.getValues("deadline") || new Date(),
      assignedTo: form.getValues("assignedTo") || "To Self",
    };
    if (initialData) {
      if (taskID) update({ newTask, taskID });
    } else {
      insert({ newTask });
    }
  };
  async function deleteDetail(id: string) {
    const res = await deleteTask({ id });
    if ("error" in res) {
      toast({
        title: "Error deleting task",
        description: res.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Task deleted successfully",
      });
      setOpenSheet((prev) => !prev);
      setTaskID("");
      router.push("/");
    }
  }
  const onDelete = () => {
    if (initialData) {
      deleteDetail(initialData.id);
    }
  };
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);
  async function addToTrello() {
    if (initialData && profile?.accessToken && profile?.listId) {
      const res = await addTaskToTrello({
        name: initialData.title,
        desc: initialData.description,
        taskid: initialData.id,
        access_token: profile?.accessToken,
        list_id: profile.listId,
      });
      if (res) {
        toast({
          title: "Task added to Trello successfully",
        });
        setOpenSheet((prev) => !prev);
        setTaskID("");
        router.push("/");
      }
    }
  }
  async function disconnectTrello() {
    if (initialData && initialData.cardId) {
      const res = await disconnectTaskFromTrello({ taskid: initialData.id });
      if (res) {
        toast({
          title: "Task disconnected from Trello successfully",
        });
        setOpenSheet((prev) => !prev);
        setTaskID("");
        router.push("/");
      }
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isLoading}
      />
      <div
        suppressHydrationWarning
        className="flex flex-row-reverse items-start py-8  relative  "
      >
        <div className="flex justify-between items-center absolute  space-x-1 w-fit">
          {profile?.accessToken &&
            profile.boardId &&
            profile.boardTitle &&
            initialData?.cardId && (
              <HoverCard>
                <HoverCardTrigger>
                  <Info className={cn(`w-4 h-4 text-muted-foreground`)} />
                </HoverCardTrigger>
                <HoverCardContent
                  className={cn(
                    `w-80 text-sm font-normal text-muted-foreground`
                  )}
                >
                  This is task is connected to Trello board:{" "}
                  {profile?.boardTitle}
                </HoverCardContent>
              </HoverCard>
            )}
          {initialData && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant={"ghost"}>
                  <EllipsisVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-[30px]" align="center">
                {profile?.accessToken && profile.boardId && (
                  <>
                    {initialData.cardId === null ? (
                      <DropdownMenuItem className="group/add cursor-pointer">
                        <div
                          onClick={() => addToTrello()}
                          className="flex justify-start items-center gap-2 cursor-pointer group-hover/add:text-[#0079bf] "
                        >
                          <Plus className="w-4 h-4" /> Add Task to Trello
                        </div>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className=" group/disconnect cursor-pointer">
                        <div
                          onClick={() => disconnectTrello()}
                          className="flex justify-start items-center gap-2 cursor-pointer group-hover/disconnect:text-red-500 "
                        >
                          <Unplug className="w-4 h-4" /> Disconnect Task from
                          Trello
                        </div>
                      </DropdownMenuItem>
                    )}
                  </>
                  // <DropdownMenuItem className="group/add cursor-pointer">
                  //   {!initialData.card_id ? (
                  //     <div
                  //       onClick={() => addToTrello()}
                  //       className="flex justify-start items-center gap-2 cursor-pointer group-hover/add:text-[#0079bf] "
                  //     >
                  //       <Plus className="w-4 h-4" /> Add Task to Trello
                  //     </div>
                  //   ) : (
                  //     <div
                  //       onClick={() => disconnectTrello()}
                  //       className="flex justify-start items-center gap-2 cursor-pointer group-hover/add:text-[#0079bf] "
                  //     >
                  //       <Plus className="w-4 h-4" /> Disconnect Task from Trello
                  //     </div>
                  //   )}
                  // </DropdownMenuItem>
                )}

                <DropdownMenuItem className="group/delete cursor-pointer">
                  <div
                    onClick={() => setOpen(true)}
                    className=" group-hover/delete:text-red-500 flex justify-start items-center gap-2 "
                  >
                    <Trash className="w-4 h-4" /> Delete
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {/* 
          {initialData && (
            <Button
              disabled={isLoading}
              variant="destructive"
              className="mr-6"
              size="sm"
              onClick={() => setOpen(true)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )} */}
        </div>
        <Form {...form}>
          <form className="w-full space-y-2 ">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <div
                    className=" 
                    inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                    
                    h-10 px-4 py-2 pl-1
                   hover:bg-accent  "
                  >
                    <FormControl>
                      <Input
                        className="text-2xl font-bold tracking-tight bg-transparent placeholder:text-gray-300"
                        disabled={isLoading}
                        placeholder="Task Title"
                        {...field}
                        ref={titleInputRef}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex gap-x-3 items-center">
                  <FormLabel className="flex gap-1 items-center mt-2 ">
                    <Loader className="w-4 h-4" /> Status
                  </FormLabel>
                  <FormControl>
                    <TaskSelectComponent
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      type="status"
                      options={StatusOption}
                      defaultValue={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="flex gap-x-3 items-center">
                  <FormLabel className="flex gap-1 items-center mt-2 ">
                    <LucideCirclePlay className="w-4 h-4 rotate-90" /> Priority
                  </FormLabel>
                  <FormControl>
                    <TaskSelectComponent
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      type="priority"
                      options={PriorityOption}
                      defaultValue={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem className="flex gap-x-3 items-center">
                  <FormLabel className="flex gap-1 items-center mt-2">
                    <UsersIcon className="w-4 h-4" /> Assignee
                  </FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost">
                          {field.value ? field.value : "Empty"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">
                              Assignee
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Enter the email to assigned task.
                            </p>
                          </div>
                          <div className="">
                            <OriginalInput
                              disabled={isLoading}
                              placeholder="example@xyz.com"
                              {...field}
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex gap-x-3 items-center">
                  <FormLabel className="flex gap-1 items-center mt-2">
                    <CalendarIcon className="w-4 h-4" /> Due
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"ghost"}
                          className={cn(
                            " justify-start pl-3  text-start font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className=" text-xl font-bold tracking-tight">
                    About this task
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Give a description about this task..."
                      className="resize-none  outline-none  border-none px-0"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="w-full flex justify-end">
              <SheetClose>
                <Button
                  disabled={isLoading}
                  className="border"
                  type="button"
                  onClick={onSubmit}
                >
                  {action}
                </Button>
              </SheetClose>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default TaskForm;
