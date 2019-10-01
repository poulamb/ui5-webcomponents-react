import { StyleClassHelper } from '@ui5/webcomponents-react-base/lib/StyleClassHelper';
import { ContentDensity } from '@ui5/webcomponents-react/lib/ContentDensity';
import { CustomListItem } from '@ui5/webcomponents-react/lib/CustomListItem';
import { Icon } from '@ui5/webcomponents-react/lib/Icon';
import { List } from '@ui5/webcomponents-react/lib/List';
import { Popover } from '@ui5/webcomponents-react/lib/Popover';
import { PopoverVerticalAlign } from '@ui5/webcomponents-react/lib/PopoverVerticalAlign';
import { SideNavigationOpenState } from '@ui5/webcomponents-react/lib/SideNavigationOpenState';
import { StandardListItem } from '@ui5/webcomponents-react/lib/StandardListItem';
import { Text } from '@ui5/webcomponents-react/lib/Text';
import React, {
  Children,
  cloneElement,
  FC,
  forwardRef,
  ReactNode,
  ReactNodeArray,
  Ref,
  useCallback,
  useEffect,
  useState
} from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import { CommonProps } from '../../interfaces/CommonProps';
import { JSSTheme } from '../../interfaces/JSSTheme';
import { sideNavigationListItemStyles } from './SideNavigationListItem.jss';

export interface SideNavigationListItemProps extends CommonProps {
  icon?: string;
  text: string;
  id: number | string;
  children?: ReactNode | ReactNodeArray;
}

const useStyles = createUseStyles<JSSTheme, keyof ReturnType<typeof sideNavigationListItemStyles>>(
  sideNavigationListItemStyles,
  {
    name: 'SideNavigationListItem'
  }
);
const SideNavigationListItem: FC<SideNavigationListItemProps> = forwardRef(
  (props: SideNavigationListItemProps, ref: Ref<HTMLDivElement>) => {
    const { icon, text, id, children, tooltip, slot, className, style } = props;

    const [isExpanded, setExpanded] = useState(false);

    const handleToggleExpand = useCallback(() => {
      setExpanded(!isExpanded);
    }, [isExpanded, setExpanded]);

    const classes = useStyles();
    const theme = useTheme() as JSSTheme;

    const listItemClasses = StyleClassHelper.of(classes.listItem);
    if (theme.contentDensity === ContentDensity.Compact) {
      listItemClasses.put(classes.compact);
    }

    if (className) {
      listItemClasses.put(className);
    }

    if (isExpanded) {
      listItemClasses.put(classes.expanded);
    }

    const noIcons = props['noIcons'];
    if (noIcons) {
      listItemClasses.put(classes.noIcons);
    }

    const childCount = Children.count(children);
    const validChildren = Children.toArray(children).filter(Boolean);

    const isOpenStateExpanded = props['openState'] === SideNavigationOpenState.Expanded;

    useEffect(() => {
      if (validChildren.length) {
        const selectedElement = validChildren.find((child: any) => child.props.id === props['selectedId']);
        if (selectedElement) {
          setExpanded(isOpenStateExpanded);
        }
      }
    }, [props['selectedId'], id, children, setExpanded, isOpenStateExpanded]);

    const isSelfSelected = props['selectedId'] === id;
    const hasSelectedChild =
      !isOpenStateExpanded &&
      childCount > 0 &&
      !!validChildren.find((child: any) => child.props.id === props['selectedId']);

    return (
      <>
        <CustomListItem
          selected={isSelfSelected || hasSelectedChild}
          ref={ref}
          className={listItemClasses.valueOf()}
          tooltip={tooltip}
          slot={slot}
          style={style}
          data-id={id}
          data-has-children={childCount > 0}
          data-is-child={props['isChild']}
        >
          {(isOpenStateExpanded || childCount === 0) && icon && !noIcons && (
            <Icon src={icon} className={classes.icon} />
          )}
          {!isOpenStateExpanded && icon && childCount > 0 && !noIcons && (
            <Popover
              open={isExpanded}
              verticalAlign={PopoverVerticalAlign.Top}
              openBy={<Icon src={icon} className={classes.icon} />}
            >
              <List>
                <StandardListItem selected={isSelfSelected} data-id={id} tooltip={tooltip}>
                  {text}
                </StandardListItem>
                {validChildren.map((child: any, index) => {
                  return (
                    <StandardListItem
                      selected={props['selectedId'] === child.props.id}
                      key={index}
                      data-id={child.props.id}
                      data-parent-id={id}
                      tooltip={child.props.tooltip || child.props.text}
                    >
                      {child.props.text}
                    </StandardListItem>
                  );
                })}
              </List>
            </Popover>
          )}
          {!isOpenStateExpanded && icon && childCount > 0 && <div className={classes.condensedExpandTriangle} />}
          {!icon && !noIcons && <span className={classes.icon} />}
          {isOpenStateExpanded && <Text className={classes.text}>{text}</Text>}
          {isOpenStateExpanded && childCount > 0 && (
            <Icon
              src={isExpanded ? 'sap-icon://navigation-down-arrow' : 'sap-icon://navigation-right-arrow'}
              className={classes.expandArrow}
              onPress={handleToggleExpand}
            />
          )}
        </CustomListItem>
        {isOpenStateExpanded &&
          isExpanded &&
          validChildren.map((child: any, index: number) => {
            const style = child.props.style || {};
            if (index !== childCount - 1) {
              style['--ui5-listitem-border-bottom'] = 'none';
            }

            return cloneElement(child, {
              icon: null,
              style,
              openState: props['openState'],
              selectedId: props['selectedId'],
              noIcons,
              isChild: true
            });
          })}
      </>
    );
  }
);

SideNavigationListItem.displayName = 'SideNavigationListItem';

SideNavigationListItem.defaultProps = {};

export { SideNavigationListItem };