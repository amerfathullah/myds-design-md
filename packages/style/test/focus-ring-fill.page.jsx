// The page focus-ring-fill.test.mjs renders in Chromium: every filled
// control, filled, rendered by the React components themselves. Focused,
// each draws its ring outside a band in `fr-gap`, which separates the ring
// from the fill (#264). Buttons in the `primary-fill` and `danger-fill`
// variants, a checked and an indeterminate Checkbox, checked Radios and
// Switches at each size, DataTable's selection columns, and Calendars with a
// selected day, a range, and their month and year views. It also has the
// tight places a filled Button sits in: a Select's header and footer, and the
// large SearchBar's search button. The test bundles this file with esbuild.
// `data-test` names what the test focuses.
import { createRoot } from "react-dom/client";

import { Button } from "../../react/src/components/button";
import { Calendar } from "../../react/src/components/calendar";
import { Checkbox } from "../../react/src/components/checkbox";
import { DataTable } from "../../react/src/components/data-table";
import {
  Radio,
  RadioButton,
  RadioItem,
  RadioLabel,
} from "../../react/src/components/radio";
import {
  SearchBar,
  SearchBarInput,
  SearchBarInputContainer,
  SearchBarSearchButton,
} from "../../react/src/components/search-bar";
import {
  Select,
  SelectContent,
  SelectFooter,
  SelectHeader,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../react/src/components/select";
import { Toggle, ToggleThumb } from "../../react/src/components/toggle";

const sizes = ["small", "medium", "large"];
const gap = { marginBottom: 24 };
const row = { ...gap, display: "flex", gap: 32, alignItems: "center" };

const october = new Date(2026, 9, 1);
const columns = [{ id: "name", accessorKey: "name", header: "Name" }];
const data = [
  { id: "1", name: "Ali" },
  { id: "2", name: "Mei" },
];

function Page() {
  return (
    <main style={{ padding: 24 }}>
      <div style={row}>
        <Button variant="primary-fill" data-test="primary-fill">
          Primary
        </Button>
        <Button variant="danger-fill" data-test="danger-fill">
          Danger
        </Button>
      </div>

      <div style={row}>
        <Checkbox defaultChecked aria-label="Checked" data-test="checked" />
        <Checkbox
          checked="indeterminate"
          aria-label="Indeterminate"
          data-test="indeterminate"
        />
      </div>

      <div style={row}>
        {sizes.map((size) => (
          <Radio key={size} size={size} defaultValue="a">
            <RadioItem>
              <RadioButton
                value="a"
                id={`radio-${size}`}
                data-test={`radio-${size}`}
              />
              <RadioLabel htmlFor={`radio-${size}`}>{size}</RadioLabel>
            </RadioItem>
          </Radio>
        ))}
      </div>

      <div style={row}>
        {sizes.map((size) => (
          <Toggle key={size} id={`switch-${size}`} size={size} defaultChecked>
            <ToggleThumb aria-label={`Switch ${size}`} />
          </Toggle>
        ))}
      </div>

      <div style={{ ...row, alignItems: "flex-start" }}>
        <div data-test="table-radio" style={{ width: 240 }}>
          <DataTable
            columns={columns}
            data={data}
            selection={{ id_by: "id", mode: "radio" }}
          />
        </div>
        <div data-test="table-checkbox" style={{ width: 240 }}>
          <DataTable
            columns={columns}
            data={data}
            selection={{ id_by: "id", mode: "checkbox" }}
          />
        </div>
      </div>

      <div style={{ ...row, alignItems: "flex-start" }}>
        <div data-test="calendar-day" style={{ width: 320 }}>
          <Calendar
            mode="single"
            selected={new Date(2026, 9, 14)}
            month={october}
          />
        </div>
        <div data-test="calendar-range" style={{ width: 320 }}>
          <Calendar
            mode="range"
            selected={{ from: new Date(2026, 9, 6), to: new Date(2026, 9, 9) }}
            month={october}
          />
        </div>
      </div>

      <div style={{ ...row, alignItems: "flex-start" }}>
        <div data-test="calendar-month" style={{ width: 320 }}>
          <Calendar
            mode="single"
            selected={new Date(2026, 9, 14)}
            month={october}
          />
        </div>
        {/* 2026 in the middle of the year view's second row, clear of the
            scroll box's edges, which clip the rings of the years along them
            (#284) */}
        <div data-test="calendar-year" style={{ width: 320 }}>
          <Calendar
            mode="single"
            selected={new Date(2026, 9, 14)}
            month={october}
            minYear={2022}
            maxYear={2036}
          />
        </div>
      </div>

      <div style={row}>
        <div data-test="search-bar" style={{ width: 320 }}>
          <SearchBar size="large">
            <SearchBarInputContainer>
              <SearchBarInput placeholder="Search" />
              <SearchBarSearchButton data-test="search-button" />
            </SearchBarInputContainer>
          </SearchBar>
        </div>
        <Select>
          <SelectTrigger aria-label="Fruit" data-test="select-trigger">
            <SelectValue placeholder="Fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectHeader>
              <Button
                variant="primary-fill"
                size="small"
                data-test="select-header-button"
              >
                All
              </Button>
            </SelectHeader>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectFooter>
              <Button
                variant="primary-fill"
                size="small"
                data-test="select-footer-button"
              >
                Apply
              </Button>
            </SelectFooter>
          </SelectContent>
        </Select>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
