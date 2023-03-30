import { PropsWithChildren } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableContainer,
  Thead,
  Tbody,
  Th,
  Tr,
  Td,
  Link,
  Tag,
  Button,
  HStack,
} from "@chakra-ui/react";

import { Address } from "@/services/data.types";
import { Offer, BuyOfferFn, CancelOfferFn } from "@/services/offerService";
import { tools } from "@/services/tools";
import { useWeb3 } from "@/hooks/useWeb3";

interface TableLinkProps {
  href: string;
}

const TableLink = ({
  href,
  children,
}: PropsWithChildren<TableLinkProps>): JSX.Element => (
  <Link href={href} _hover={{ color: "blue.600" }}>
    {children}
  </Link>
);

export interface OfferListProps {
  offers: Array<Offer>;
  onEditOffer(offer: Offer): void;
  buyOffer: BuyOfferFn;
  cancelOffer: CancelOfferFn;
  currentUser: Address;
}
export const OfferList = ({
  offers,
  onEditOffer,
  buyOffer,
  cancelOffer,
  currentUser,
}: OfferListProps): JSX.Element => {
  const { getAddressExplorerUrl, getTokenExplorerUrl } = useWeb3();

  const youBadge = (
    <Tag py={1} px={2} size="sm" bg="blue.600" color="white">
      YOU
    </Tag>
  );
  const columnHelper = createColumnHelper<Offer>();
  const columns = [
    columnHelper.accessor("soldTokenSymbol", {
      header: "Sold Token",
      cell: (props) => {
        const value = props.getValue();
        return (
          <TableLink href={`${getTokenExplorerUrl(value)}`}>{value}</TableLink>
        );
      },
    }),
    columnHelper.accessor("soldTokenAmount", { header: "Amount" }),
    columnHelper.accessor("toTokenSymbol", {
      header: "For",
      cell: (props) => {
        const value = props.getValue();
        return (
          <TableLink href={`${getTokenExplorerUrl(value)}`}>{value}</TableLink>
        );
      },
    }),
    columnHelper.accessor("toTokenAmount", { header: "Amount" }),
    columnHelper.accessor(
      (row) => {
        const rate = tools.formatAmount(
          row.toTokenAmount / row.soldTokenAmount
        );
        return `1 ${row.soldTokenSymbol} ~ ${rate} ${row.toTokenSymbol}`;
      },
      { header: "Rate" }
    ),
    columnHelper.accessor(
      (row) =>
        tools.isSameAddress(row.owner, currentUser)
          ? "you"
          : tools.shortenAddress(row.owner),
      {
        cell: (props) =>
          props.getValue() === "you" ? (
            youBadge
          ) : (
            <TableLink href={`${getAddressExplorerUrl(props.getValue())}`}>
              {props.getValue()}
            </TableLink>
          ),
        header: "Owner",
      }
    ),
    columnHelper.accessor(
      (row) =>
        row.reservedFor
          ? tools.isSameAddress(row.reservedFor, currentUser)
            ? "you"
            : tools.shortenAddress(row.reservedFor)
          : "-",
      {
        id: "reservedFor",
        cell: (props) =>
          props.getValue() === "you" ? (
            youBadge
          ) : (
            <TableLink href={`${getAddressExplorerUrl(props.getValue())}`}>
              {props.getValue()}
            </TableLink>
          ),
        header: "Reserved For",
      }
    ),
    columnHelper.accessor((row) => row, {
      id: "actions",
      header: "Actions",
      cell: (props) => {
        const o = props.getValue();
        return tools.isSameAddress(o.owner, currentUser) ? (
          <HStack>
            <Button
              size="xs"
              width="60px"
              bg="red.200"
              onClick={() => cancelOffer(o.id!)}>
              Cancel
            </Button>
            <Button
              size="xs"
              width="60px"
              bg="blue.200"
              onClick={() => onEditOffer(o)}>
              Edit
            </Button>
          </HStack>
        ) : (
          <Button
            size="xs"
            width="60px"
            bg="green.200"
            onClick={() => buyOffer(o)}>
            Buy
          </Button>
        );
      },
    }),
  ];
  const table = useReactTable({
    data: offers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <TableContainer
      borderColor="brandColorSecondary"
      color="brandColorPrimary"
      bgColor="brandBgSecondary"
      m={4}
      p={4}
      rounded="lg">
      <Table variant="unstyled" size="sm">
        <Thead
          color="white"
          borderBottomWidth="1px"
          borderColor="brandColorPrimary">
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.map((row) => (
            <Tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
