import { Flex, Button, Checkbox, Input, Select } from "@chakra-ui/react";

import { ViewSelector, OnSetViewFn, ViewTypeKey } from "@/components/ui";
import { Amount, Address, TokenSymbol } from "@/services/data.types";

export interface OfferGridControlsProps {
  currentUser?: Address;
  viewType: ViewTypeKey;
  soldTokenSymbols: Array<TokenSymbol>;
  toTokenSymbols: Array<TokenSymbol>;
  onFilterSoldTokenAmount(amount: Amount): void;
  onFilterSoldTokenSymbol(symbol: TokenSymbol): void;
  onFiltertoTokenAmount(amount: Amount): void;
  onFiltertoTokenSymbol(symbol: TokenSymbol): void;
  onFilterOwnerOnly(isOwnerOnly: boolean): void;
  onFilterReservedOnly(isReservedOnly: boolean): void;
  onSetView: OnSetViewFn;
  onCreate(): void;
}
export const OfferGridControls = ({
  currentUser,
  viewType,
  soldTokenSymbols,
  toTokenSymbols,
  onFilterSoldTokenAmount,
  onFilterSoldTokenSymbol,
  onFiltertoTokenAmount,
  onFiltertoTokenSymbol,
  onFilterOwnerOnly,
  onFilterReservedOnly,
  onSetView,
  onCreate,
}: OfferGridControlsProps): JSX.Element => {
  const _onFilterSoldTokenAmount = (e: React.ChangeEvent<HTMLInputElement>) =>
    onFilterSoldTokenAmount(Number.parseFloat(e.target.value));
  const _onFilterSoldTokenSymbol = (e: React.ChangeEvent<HTMLSelectElement>) =>
    onFilterSoldTokenSymbol(e.target.value);
  const _onFiltertoTokenAmount = (e: React.ChangeEvent<HTMLInputElement>) =>
    onFiltertoTokenAmount(Number.parseFloat(e.target.value));
  const _onFiltertoTokenSymbol = (e: React.ChangeEvent<HTMLSelectElement>) =>
    onFiltertoTokenSymbol(e.target.value);
  const _onFilterOwnerOnly = (e: React.ChangeEvent<HTMLInputElement>) =>
    onFilterOwnerOnly(e.target.checked);
  const _onFilterReservedOnly = (e: React.ChangeEvent<HTMLInputElement>) =>
    onFilterReservedOnly(e.target.checked);

  return (
    <Flex justifyContent="space-between" p={4} bg="brandBgPrimary">
      <ViewSelector defaultValue={viewType} onSetView={onSetView} />
      <Flex gap={4} alignItems="center" whiteSpace="nowrap">
        {/* sold token */}
        <>
          <Input
            placeholder="min. amount..."
            color="brandColorPrimary"
            bgColor="brandBgTernary"
            borderColor="brandColorSecondary"
            size="sm"
            onChange={_onFilterSoldTokenAmount}
          />
          <Select
            placeholder="sold token"
            color="brandColorPrimary"
            bgColor="brandBgTernary"
            borderColor="brandColorSecondary"
            size="sm"
            onChange={_onFilterSoldTokenSymbol}>
            {soldTokenSymbols.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </>
        {/* to token */}
        <>
          <Input
            placeholder="min. amount..."
            color="brandColorPrimary"
            bgColor="brandBgTernary"
            borderColor="brandColorSecondary"
            size="sm"
            onChange={_onFiltertoTokenAmount}
          />
          <Select
            placeholder="for"
            color="brandColorPrimary"
            bgColor="brandBgTernary"
            borderColor="brandColorSecondary"
            size="sm"
            onChange={_onFiltertoTokenSymbol}>
            {toTokenSymbols.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </>
        <Checkbox color="brandColorPrimary" onChange={_onFilterOwnerOnly}>
          owner
        </Checkbox>
        <Checkbox color="brandColorPrimary" onChange={_onFilterReservedOnly}>
          reserved
        </Checkbox>
      </Flex>
      {currentUser && (
        <Button _hover={{ bg: "blue.400", color: "white" }} onClick={onCreate}>
          Create
        </Button>
      )}
    </Flex>
  );
};
