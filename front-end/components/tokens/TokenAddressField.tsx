import { Input } from "@chakra-ui/react";
import { Address } from "@/services/data.types";
import { tools } from "@/services/tools";

export interface TokenAddressFieldProps {
  value: Address;
  onChange(value: Address): void;
  placeholder?: string;
  readOnly?: boolean;
}
export const TokenAddressField = ({
  value,
  onChange,
  placeholder,
  readOnly = false,
}: TokenAddressFieldProps): JSX.Element => {
  const _onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(e.target.value);

  return (
    <Input
      fontSize="xs"
      isInvalid={Boolean(value) && !tools.isAddressValid(value)}
      borderColor={
        value !== "" && tools.isAddressValid(value) ? "lime" : "gray.200"
      }
      errorBorderColor="red.300"
      placeholder={placeholder || "token address..."}
      value={value}
      isReadOnly={readOnly}
      onChange={_onChange}
    />
  );
};
