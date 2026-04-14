import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, expect, waitFor } from "@storybook/test";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "./sheet";
import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import { Label } from "../../atoms/label/label";

const meta: Meta<typeof Sheet> = {
  title: "Overlays/Sheet",
  component: Sheet,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

const ProfileForm = () => (
  <div className="flex flex-col gap-4 px-4 py-2">
    <div className="flex flex-col gap-2">
      <Label htmlFor="name">Name</Label>
      <Input id="name" defaultValue="Jane Doe" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="username">Username</Label>
      <Input id="username" defaultValue="@janedoe" />
    </div>
  </div>
);

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Save when you're done.
          </SheetDescription>
        </SheetHeader>
        <ProfileForm />
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Edit profile" });
    await userEvent.click(trigger);
    const body = within(document.body);
    await waitFor(async () => {
      await expect(
        body.getByRole("dialog", { name: "Edit profile" })
      ).toBeInTheDocument();
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(
        body.queryByRole("dialog", { name: "Edit profile" })
      ).not.toBeInTheDocument();
    });
  },
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open left sheet</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            A side-anchored navigation panel.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open bottom sheet</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Quick actions</SheetTitle>
          <SheetDescription>
            Bottom-anchored sheets work well on mobile layouts.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};
