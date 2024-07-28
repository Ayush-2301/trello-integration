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
  FormMessage,
} from "@/components/ui/form";
import { Box } from "@/components/ui/box";

import { useState, createElement } from "react";
import { CheckSquare2, EyeIcon, EyeOffIcon } from "lucide-react";
import { AccessTokenForm, accessTokenSchema } from "../schema";
import { updateProfile } from "@/lib/actions/profile";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@radix-ui/react-label";
import { useRouter } from "next/navigation";

const IntegrationForm = ({
  accessToken,
  boardId,
}: {
  accessToken: string | null;
  boardId: string | null;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const form = useForm<z.infer<typeof accessTokenSchema>>({
    resolver: zodResolver(accessTokenSchema),
    defaultValues: {
      accesstoken: "",
    },
  });
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
  return (
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
                <Button type="submit">Submit</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Label className="flex items-center gap-2 text-3xl font-semibold">
          Trello Account is Connected{" "}
          <CheckSquare2 className="w-8 h-8  text-green-500" />{" "}
        </Label>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Connect to Asana</CardTitle>
          <CardDescription>
            Click the Connect button to get the access token.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex  w-full gap-2">
          <form className="w-full">
            <Input placeholder="Access Token" />
          </form>
          <Button>Connect</Button>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IntegrationForm;
