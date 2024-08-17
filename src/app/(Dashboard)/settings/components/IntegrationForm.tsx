"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
const TRELLO_API_KEY = process.env.NEXT_PUBLIC_TRELLO_API_KEY;
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Box } from "@/components/ui/box";

import { useState, createElement } from "react";
import {
  CheckSquare2,
  EllipsisVertical,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import {
  AccessTokenForm,
  accessTokenSchema,
  updateSchema,
  UpdateSchemaForm,
} from "../schema";
import {
  deleteTrelloConfig,
  updateProfile,
  updateTrelloConfig,
} from "@/lib/actions/profile";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@radix-ui/react-label";
import { useRouter } from "next/navigation";
import { profile } from "console";
import { TrelloAlertModal } from "@/components/modal/trello-alert-modal";

const IntegrationForm = ({
  accessToken,
  boardId,
  boardTitle,
}: {
  accessToken: string | null;
  boardId: string | null;
  boardTitle: string | null;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [showUpdateSettings, setShowUpdateSettings] = useState(false);
  const form = useForm<z.infer<typeof accessTokenSchema>>({
    resolver: zodResolver(accessTokenSchema),
    defaultValues: {
      accesstoken: "",
      boardTitle: "",
    },
  });
  const updateForm = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      boardTitle: boardTitle!,
      accesstoken: "",
    },
  });
  const isLoading = updateForm.formState.isLoading;
  async function onSubmit(value: AccessTokenForm) {
    const res = await updateProfile({ value });
    if (res) {
      toast({
        title: "Success",
        description: "Your Trello board is connected",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to connect to Trello",
      });
    }
    form.reset();
  }

  async function onUpdate(value: UpdateSchemaForm) {
    const res = await updateTrelloConfig({
      accesstoken: value.accesstoken,
      boardTitle: value.boardTitle,
      boardId: boardId!,
      previousAccesstoken: accessToken!,
    });
    if (res?.message === "error") {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to update Trello configuration",
      });
    } else {
      setShowUpdateSettings(false);
      toast({
        title: "Trello Configuration updated",
      });
      router.push("/settings/integrations");
      router.refresh();
    }
    updateForm.reset();
  }
  async function handleDeleteTrelloConfig() {
    const res = await deleteTrelloConfig({
      previousAccesstoken: accessToken!,
      boardId: boardId!,
    });
    if (res?.message === "error") {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to delete Trello configuration",
      });
    } else {
      toast({
        title: "Trello Configuration deleted",
      });
      setOpen(false);
      router.push("/settings/integrations");
    }
  }

  return (
    <>
      <TrelloAlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDeleteTrelloConfig}
        loading={isLoading}
      />
      <div className="grid gap-6">
        {!accessToken && !boardId ? (
          <Card>
            <CardHeader>
              <CardTitle>Connect to Trello</CardTitle>
              <CardDescription>
                Click
                <a
                  href={`https://trello.com/1/authorize?expiration=never&scope=read,write,account&response_type=token&key=${TRELLO_API_KEY}`}
                  target="_blank"
                  className="mx-1 underline text-primary"
                >
                  here
                </a>
                to get the access token.
              </CardDescription>
            </CardHeader>
            <CardContent className="">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="accesstoken"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Box className="relative">
                            <Input
                              {...field}
                              type={passwordVisibility ? "text" : "password"}
                              placeholder={"Access Token"}
                              className={`pr-12 `}
                            />
                            <Box
                              className="absolute inset-y-0 right-0 flex cursor-pointer items-center p-3 text-muted-foreground"
                              onClick={() =>
                                setPasswordVisibility(!passwordVisibility)
                              }
                            >
                              {createElement(
                                passwordVisibility ? EyeOffIcon : EyeIcon,
                                {
                                  className: "h-6 w-6",
                                }
                              )}
                            </Box>
                          </Box>
                        </FormControl>
                        <FormDescription>
                          Paste the copied access token to allow insightflow to
                          connect with your trello account.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="boardTitle"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder={"Board Title"} />
                          </FormControl>
                          <FormDescription>
                            Give a Title to your board
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <Button type="submit">Submit</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <>
            {!showUpdateSettings ? (
              <div className="p-4 bg-gray-100 rounded-md">
                <Label className="flex items-center gap-2 text-2xl font-semibold mb-2">
                  Trello Account is Connected
                  <CheckSquare2 className="w-8 h-8 text-green-500" />
                </Label>
                <ul className="list-disc list-inside text-lg space-y-2">
                  <li>
                    Go to the <strong>Tasks</strong> page and click on a
                    particular task.
                  </li>
                  <li>
                    Open the three-dot menu{" "}
                    <EllipsisVertical className="inline-block bg-white p-1 rounded-md" />{" "}
                    and select <strong>Add Task to Trello</strong>.
                  </li>
                  <li>
                    A board named <strong>{boardTitle}</strong> is created, and
                    inside that board, a list named{" "}
                    <strong>{boardTitle} Tasks</strong> is created.
                  </li>
                  <li>
                    New cards will be added to the{" "}
                    <strong>{boardTitle} Tasks</strong> list for each connected
                    task.
                  </li>
                  <li>
                    Once a task is added to Trello, you can disconnect it to
                    stop syncing changes.
                  </li>
                </ul>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Connect to New Trello Account</CardTitle>
                  <CardDescription>
                    Click
                    <a
                      href={`https://trello.com/1/authorize?expiration=never&scope=read,write,account&response_type=token&key=${TRELLO_API_KEY}`}
                      target="_blank"
                      className="mx-1 underline text-primary"
                    >
                      here
                    </a>
                    to get the new access token.
                  </CardDescription>
                </CardHeader>
                <CardContent className="">
                  <Form {...updateForm}>
                    <form
                      onSubmit={updateForm.handleSubmit(onUpdate)}
                      className="space-y-8"
                    >
                      <FormField
                        control={updateForm.control}
                        name="accesstoken"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Box className="relative">
                                <Input
                                  {...field}
                                  type={
                                    passwordVisibility ? "text" : "password"
                                  }
                                  placeholder={"Access Token"}
                                  className={`pr-12 `}
                                />
                                <Box
                                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center p-3 text-muted-foreground"
                                  onClick={() =>
                                    setPasswordVisibility(!passwordVisibility)
                                  }
                                >
                                  {createElement(
                                    passwordVisibility ? EyeOffIcon : EyeIcon,
                                    {
                                      className: "h-6 w-6",
                                    }
                                  )}
                                </Box>
                              </Box>
                            </FormControl>
                            <FormDescription>
                              Paste the copied access token to allow insightflow
                              to connect with your trello account.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={updateForm.control}
                        name="boardTitle"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder={"Board Title"} />
                              </FormControl>
                              <FormDescription>
                                Want to give a new Title to your board?
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <Button type="submit">Submit</Button>
                      <Button
                        variant={"outline"}
                        className="ml-2"
                        type="button"
                        onClick={() =>
                          setShowUpdateSettings(!showUpdateSettings)
                        }
                      >
                        Cancel
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
            {!showUpdateSettings && (
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowUpdateSettings(!showUpdateSettings)}
                >
                  Update
                </Button>
                <Button variant="destructive" onClick={() => setOpen(true)}>
                  Delete
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default IntegrationForm;
