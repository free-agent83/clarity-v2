import type { Meta, StoryObj } from "@storybook/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

const meta: Meta<typeof Table> = {
  title: "Data/Table",
  component: Table,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>One</TableHead>
          <TableHead>Two</TableHead>
          <TableHead>Three</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>1A</TableCell>
          <TableCell>1B</TableCell>
          <TableCell>1C</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>2A</TableCell>
          <TableCell>2B</TableCell>
          <TableCell>2C</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>3A</TableCell>
          <TableCell>3B</TableCell>
          <TableCell>3C</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
