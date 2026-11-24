// The page summary-list.test.mjs renders in Chromium: summary lists 660px
// wide, as the stories render them, each with `data-test` on its root.
//
// - `docs`: the develop docs' example, row for row.
// - `two-buttons`: a row whose action holds two buttons.
// - `action-colspan`: rows with a SummaryListAddition, and one whose action
//   has `colSpan={2}` in place of an addition.
// - `term-rowspan`: a term with `rowSpan={2}` over two details.
// - `term-colspan`: a term with `colSpan={2}` in place of a detail.
// - `no-detail`: a row with a term and an action but no detail.
//
// The test bundles this file with esbuild.
import { useEffect } from "react";
import { createRoot } from "react-dom/client";

import { Button } from "../../react/src/components/button";
import { SwapIcon } from "../../react/src/icons/swap";
import {
  SummaryList,
  SummaryListAction,
  SummaryListAddition,
  SummaryListBody,
  SummaryListDetail,
  SummaryListHeader,
  SummaryListRow,
  SummaryListTerm,
} from "../../react/src/components/summary-list";
import { Tag } from "../../react/src/components/tag";

window.ready = [];

// A button as the docs put one in an action
const ActionButton = ({ children }) => (
  <Button variant="primary-ghost" className="h-8">
    {children}
  </Button>
);

// A list 660px wide, as the stories render one, titled `title`
const List = ({ name, title, children }) => (
  <div className="w-[660px]">
    <SummaryList data-test={name}>
      <SummaryListHeader>{title}</SummaryListHeader>
      <SummaryListBody>{children}</SummaryListBody>
    </SummaryList>
  </div>
);

// A row with a term, a detail and an empty action
const Row = ({ term, detail }) => (
  <SummaryListRow>
    <SummaryListTerm>{term}</SummaryListTerm>
    <SummaryListDetail>{detail}</SummaryListDetail>
    <SummaryListAction></SummaryListAction>
  </SummaryListRow>
);

function Page() {
  useEffect(() => void window.ready.push("page"), []);
  return (
    <div className="space-y-10 p-6">
      <List name="docs" title="Government Subsidy Application">
        <Row term="Application ID" detail="SUB12345" />
        <Row term="Applicant Name" detail="Lee Ming Wei" />
        <Row term="Submission Date" detail="15/10/2024 17:35:00" />
        <Row term="Subsidy Type" detail="Petrol Subsidy" />
        <SummaryListRow>
          <SummaryListTerm>Status</SummaryListTerm>
          <SummaryListDetail className="py-2">
            <Tag
              variant="warning"
              size="medium"
              className="h-fit"
              mode="default"
            >
              Pending
            </Tag>
          </SummaryListDetail>
          <SummaryListAction>
            <ActionButton>
              <SwapIcon /> Refresh
            </ActionButton>
          </SummaryListAction>
        </SummaryListRow>
        <SummaryListRow>
          <SummaryListTerm>Document Submitted</SummaryListTerm>
          <SummaryListDetail>
            <div>Proof Of Income</div>
            <div>ID Copy</div>
          </SummaryListDetail>
          <SummaryListAction>
            <ActionButton>Add More</ActionButton>
          </SummaryListAction>
        </SummaryListRow>
        <Row term="Expected Response Date" detail="23/03/2023 17:35:00" />
      </List>

      <List name="two-buttons" title="Two buttons">
        <Row term="Application ID" detail="SUB12345" />
        <SummaryListRow>
          <SummaryListTerm>Applicant Name</SummaryListTerm>
          <SummaryListDetail>Lee Ming Wei</SummaryListDetail>
          <SummaryListAction>
            <ActionButton>Edit</ActionButton>
            <ActionButton>Remove</ActionButton>
          </SummaryListAction>
        </SummaryListRow>
      </List>

      <List name="action-colspan" title="An action across two columns">
        <SummaryListRow>
          <SummaryListTerm>Application ID</SummaryListTerm>
          <SummaryListDetail>SUB12345</SummaryListDetail>
          <SummaryListAction>
            <ActionButton>Change</ActionButton>
          </SummaryListAction>
          <SummaryListAddition>Additional information</SummaryListAddition>
        </SummaryListRow>
        <SummaryListRow>
          <SummaryListTerm>Applicant Name</SummaryListTerm>
          <SummaryListDetail>Lee Ming Wei</SummaryListDetail>
          <SummaryListAction colSpan={2}>
            <ActionButton>Edit Name</ActionButton>
          </SummaryListAction>
        </SummaryListRow>
      </List>

      <List name="term-rowspan" title="A term across two rows">
        <Row term="Application ID" detail="SUB12345" />
        <SummaryListRow>
          <SummaryListTerm rowSpan={2}>Document Submitted</SummaryListTerm>
          <SummaryListDetail>Proof Of Income</SummaryListDetail>
          <SummaryListAction>
            <ActionButton>Change</ActionButton>
          </SummaryListAction>
        </SummaryListRow>
        <SummaryListRow>
          <SummaryListDetail>ID Copy</SummaryListDetail>
          <SummaryListAction>
            <ActionButton>Change</ActionButton>
          </SummaryListAction>
        </SummaryListRow>
      </List>

      <List name="term-colspan" title="A term across two columns">
        <Row term="Application ID" detail="SUB12345" />
        <SummaryListRow>
          <SummaryListTerm colSpan={2}>Supporting documents</SummaryListTerm>
          <SummaryListAction>
            <ActionButton>Add More</ActionButton>
          </SummaryListAction>
        </SummaryListRow>
      </List>

      <List name="no-detail" title="A row without a detail">
        <Row term="Application ID" detail="SUB12345" />
        <SummaryListRow>
          <SummaryListTerm>Supporting documents</SummaryListTerm>
          <SummaryListAction>
            <ActionButton>Add More</ActionButton>
          </SummaryListAction>
        </SummaryListRow>
      </List>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
