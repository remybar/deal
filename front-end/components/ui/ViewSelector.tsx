import { ChangeEvent } from "react";
import { Select } from "@chakra-ui/react";

export enum ViewType {
  ListView = "List View",
  GridView = "Grid View",
}
export type ViewTypeKey = keyof typeof ViewType;

export type OnSetViewFn = (viewType: ViewTypeKey) => void;

export interface ViewSelectorProps {
  defaultValue: ViewTypeKey;
  onSetView: OnSetViewFn;
}
export const ViewSelector = ({
  defaultValue,
  onSetView,
}: ViewSelectorProps): JSX.Element => {
  const onChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    onSetView(event.target.value as ViewTypeKey);
  };

  return (
    <Select
      color="white"
      defaultValue={defaultValue as ViewType}
      w={120}
      onChange={onChange}>
      {Object.keys(ViewType).map((k) => {
        const viewName = ViewType[k as keyof typeof ViewType];
        return (
          <option key={k} value={k}>
            {viewName}
          </option>
        );
      })}
    </Select>
  );
};
