import { useEffect, useRef } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { observer } from "mobx-react";
// types
import {
  GroupByColumnTypes,
  TGroupedIssues,
  TIssue,
  IIssueDisplayProperties,
  TIssueMap,
  TUnGroupedIssues,
  IGroupByColumn,
  TIssueOrderByOptions,
  TIssueGroupByOptions,
} from "@plane/types";
// components
import { MultipleSelectGroup } from "@/components/core";
import { IssueBulkOperationsRoot } from "@/components/issues";
// hooks
import { EIssuesStoreType } from "@/constants/issue";
import { useCycle, useLabel, useMember, useModule, useProject, useProjectState } from "@/hooks/store";
// utils
import { getGroupByColumns, isWorkspaceLevel, GroupDropLocation } from "../utils";
import { ListGroup } from "./list-group";
import { TRenderQuickActions } from "./list-view-types";

export interface IGroupByList {
  issueIds: TGroupedIssues | TUnGroupedIssues | any;
  issuesMap: TIssueMap;
  group_by: TIssueGroupByOptions | null;
  orderBy: TIssueOrderByOptions | undefined;
  updateIssue: ((projectId: string, issueId: string, data: Partial<TIssue>) => Promise<void>) | undefined;
  quickActions: TRenderQuickActions;
  displayProperties: IIssueDisplayProperties | undefined;
  enableIssueQuickAdd: boolean;
  showEmptyGroup?: boolean;
  canEditProperties: (projectId: string | undefined) => boolean;
  quickAddCallback?: (
    workspaceSlug: string,
    projectId: string,
    data: TIssue,
    viewId?: string
  ) => Promise<TIssue | undefined>;
  disableIssueCreation?: boolean;
  storeType: EIssuesStoreType;
  handleOnDrop: (source: GroupDropLocation, destination: GroupDropLocation) => Promise<void>;
  addIssuesToView?: (issueIds: string[]) => Promise<TIssue>;
  viewId?: string;
  isCompletedCycle?: boolean;
}

const GroupByList: React.FC<IGroupByList> = observer((props) => {
  const {
    issueIds,
    issuesMap,
    group_by,
    orderBy,
    updateIssue,
    quickActions,
    displayProperties,
    enableIssueQuickAdd,
    showEmptyGroup,
    canEditProperties,
    quickAddCallback,
    viewId,
    disableIssueCreation,
    storeType,
    handleOnDrop,
    addIssuesToView,
    isCompletedCycle = false,
  } = props;
  // store hooks
  const member = useMember();
  const project = useProject();
  const label = useLabel();
  const projectState = useProjectState();
  const cycle = useCycle();
  const projectModule = useModule();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const groups = getGroupByColumns(
    group_by as GroupByColumnTypes,
    project,
    cycle,
    projectModule,
    label,
    projectState,
    member,
    true,
    isWorkspaceLevel(storeType)
  );

  // Enable Auto Scroll for Main Kanban
  useEffect(() => {
    const element = containerRef.current;

    if (!element) return;

    return combine(
      autoScrollForElements({
        element,
      })
    );
  }, [containerRef]);

  if (!groups) return null;

  const validateEmptyIssueGroups = (issues: TIssue[]) => {
    const issuesCount = issues?.length || 0;
    if (!showEmptyGroup && issuesCount <= 0) return false;
    return true;
  };

  const getGroupIndex = (groupId: string | undefined) => groups.findIndex(({ id }) => id === groupId);

  const is_list = group_by === null ? true : false;

  // create groupIds array and entities object for bulk ops
  const groupIds = groups.map((g) => g.id);
  const orderedGroups: Record<string, string[]> = {};
  groupIds.forEach((gID) => {
    orderedGroups[gID] = [];
  });
  let entities: Record<string, string[]> = {};

  if (is_list) {
    entities = Object.assign(orderedGroups, { [groupIds[0]]: issueIds });
  } else {
    entities = Object.assign(orderedGroups, { ...issueIds });
  }

  return (
    <div className="relative size-full flex flex-col">
      {groups && (
        <MultipleSelectGroup containerRef={containerRef} entities={entities} disabled>
          {(helpers) => (
            <>
              <div
                ref={containerRef}
                className="size-full overflow-auto vertical-scrollbar scrollbar-lg vertical-scrollbar-margin-top-md"
              >
                {groups.map(
                  (group: IGroupByColumn) =>
                    validateEmptyIssueGroups(is_list ? issueIds : issueIds?.[group.id]) && (
                      <ListGroup
                        key={group.id}
                        group={group}
                        getGroupIndex={getGroupIndex}
                        issueIds={issueIds}
                        issuesMap={issuesMap}
                        group_by={group_by}
                        orderBy={orderBy}
                        updateIssue={updateIssue}
                        quickActions={quickActions}
                        displayProperties={displayProperties}
                        enableIssueQuickAdd={enableIssueQuickAdd}
                        canEditProperties={canEditProperties}
                        storeType={storeType}
                        containerRef={containerRef}
                        quickAddCallback={quickAddCallback}
                        disableIssueCreation={disableIssueCreation}
                        addIssuesToView={addIssuesToView}
                        handleOnDrop={handleOnDrop}
                        viewId={viewId}
                        isCompletedCycle={isCompletedCycle}
                        selectionHelpers={helpers}
                      />
                    )
                )}
              </div>
              <IssueBulkOperationsRoot selectionHelpers={helpers} />
            </>
          )}
        </MultipleSelectGroup>
      )}
    </div>
  );
});

GroupByList.displayName = "GroupByList";

export interface IList {
  issueIds: TGroupedIssues | TUnGroupedIssues | any;
  issuesMap: TIssueMap;
  group_by: TIssueGroupByOptions | null;
  orderBy: TIssueOrderByOptions | undefined;
  updateIssue: ((projectId: string, issueId: string, data: Partial<TIssue>) => Promise<void>) | undefined;
  quickActions: TRenderQuickActions;
  displayProperties: IIssueDisplayProperties | undefined;
  showEmptyGroup: boolean;
  enableIssueQuickAdd: boolean;
  canEditProperties: (projectId: string | undefined) => boolean;
  quickAddCallback?: (
    workspaceSlug: string,
    projectId: string,
    data: TIssue,
    viewId?: string
  ) => Promise<TIssue | undefined>;
  viewId?: string;
  disableIssueCreation?: boolean;
  storeType: EIssuesStoreType;
  handleOnDrop: (source: GroupDropLocation, destination: GroupDropLocation) => Promise<void>;
  addIssuesToView?: (issueIds: string[]) => Promise<TIssue>;
  isCompletedCycle?: boolean;
}

export const List: React.FC<IList> = (props) => {
  const {
    issueIds,
    issuesMap,
    group_by,
    orderBy,
    updateIssue,
    quickActions,
    quickAddCallback,
    viewId,
    displayProperties,
    showEmptyGroup,
    enableIssueQuickAdd,
    canEditProperties,
    disableIssueCreation,
    storeType,
    handleOnDrop,
    addIssuesToView,
    isCompletedCycle = false,
  } = props;

  return (
    <div className="relative h-full w-full">
      <GroupByList
        issueIds={issueIds as TUnGroupedIssues}
        issuesMap={issuesMap}
        group_by={group_by}
        orderBy={orderBy}
        updateIssue={updateIssue}
        quickActions={quickActions}
        displayProperties={displayProperties}
        enableIssueQuickAdd={enableIssueQuickAdd}
        showEmptyGroup={showEmptyGroup}
        canEditProperties={canEditProperties}
        quickAddCallback={quickAddCallback}
        viewId={viewId}
        disableIssueCreation={disableIssueCreation}
        storeType={storeType}
        handleOnDrop={handleOnDrop}
        addIssuesToView={addIssuesToView}
        isCompletedCycle={isCompletedCycle}
      />
    </div>
  );
};
