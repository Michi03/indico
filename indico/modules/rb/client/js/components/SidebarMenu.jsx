// This file is part of Indico.
// Copyright (C) 2002 - 2019 CERN
//
// Indico is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see the
// LICENSE file for more details.

import contactURL from 'indico-url:core.contact';
import tosURL from 'indico-url:legal.display_tos';

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Icon, Popup, Sidebar, Menu, Modal} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {push as pushRoute} from 'connected-react-router';
import {Overridable} from 'indico/react/util';
import {Translate} from 'indico/react/i18n';

import {selectors as userSelectors, actions as userActions} from '../common/user';
import {selectors as configSelectors} from '../common/config';
import {actions as blockingsActions} from '../modules/blockings';
import {actions as filtersActions} from '../common/filters';
import * as globalActions from '../actions';

import './SidebarMenu.module.scss';


export function SidebarTrigger({onClick, active}) {
    const icon = <Icon name="bars" size="large" />;
    // The icon can only be wrapped by the 'trigger' element if it's clickable,
    // otherwise the 'click outside' event would be caught both by the EventStack
    // in SUI's Sidebar component and the trigger's onClick handler (and silently
    // cancel itself)
    return (
        <div className={active ? 'active' : ''} styleName="sidebar-button">
            {active
                ? icon
                : <div onClick={onClick}>{icon}</div>
            }
        </div>
    );
}

SidebarTrigger.propTypes = {
    onClick: PropTypes.func.isRequired,
    active: PropTypes.bool.isRequired
};

function SidebarMenu({
    isAdmin,
    isAdminOverrideEnabled,
    hasOwnedRooms,
    gotoMyBookings,
    gotoBookingsInMyRooms,
    gotoMyRoomsList,
    gotoMyBlockings,
    gotoRBAdminArea,
    toggleAdminOverride,
    visible,
    onClickOption,
    hideOptions,
    hasTOS,
    tosHTML,
    helpURL,
    contactEmail,
}) {
    const options = [
        {
            key: 'my_bookings',
            icon: 'list alternate outline',
            text: Translate.string('My Bookings'),
            onClick: gotoMyBookings,
        },
        {
            key: 'bookings_my_rooms',
            icon: 'checkmark',
            text: Translate.string('Bookings in My Rooms'),
            onClick: gotoBookingsInMyRooms,
            onlyIf: hasOwnedRooms
        },
        {
            key: 'my_rooms',
            icon: 'user',
            text: Translate.string('List of My Rooms'),
            onClick: gotoMyRoomsList,
            onlyIf: hasOwnedRooms
        },
        {
            key: 'my_blockings',
            icon: 'window close outline',
            text: Translate.string('My Blockings'),
            onClick: gotoMyBlockings,
            onlyIf: !hideOptions.myBlockings
        },
        {
            key: 'isAdmin',
            icon: 'cogs',
            text: Translate.string('Administration'),
            onClick: gotoRBAdminArea,
            onlyIf: isAdmin
        },
        {
            key: 'adminOverride',
            icon: isAdminOverrideEnabled ? 'unlock' : 'lock',
            text: Translate.string('Admin Override'),
            iconColor: isAdminOverrideEnabled ? 'orange' : undefined,
            active: isAdminOverrideEnabled,
            onClick: toggleAdminOverride,
            onlyIf: isAdmin,
            tooltip: Translate.string('Admin Override gives you unrestricted access to all rooms and bookings.')
        }
    ].filter(({onlyIf}) => onlyIf === undefined || onlyIf);

    const [contactVisible, setContactVisible] = useState(false);
    const [termsVisible, setTermsVisible] = useState(false);

    return (
        <>
            <Sidebar as={Menu}
                     animation="overlay"
                     icon="labeled"
                     vertical
                     width="thin"
                     direction="right"
                     onHide={onClickOption}
                     inverted
                     visible={visible}
                     styleName="sidebar">
                {options.map(({key, text, icon, onClick, iconColor, active, tooltip}) => {
                    const item = (
                        <Menu.Item as="a" key={key} active={active} onClick={() => {
                            onClick();
                            if (onClickOption) {
                                onClickOption();
                            }
                        }}>
                            <Icon name={icon} color={iconColor} />
                            {text}
                        </Menu.Item>
                    );
                    if (!tooltip) {
                        return item;
                    }
                    return <Popup trigger={item} content={tooltip} key={key} position="left center" />;
                })}
                <div styleName="bottom-align">
                    {helpURL && (
                        <Menu.Item as="a" href={helpURL}>
                            <Translate>Help</Translate>
                        </Menu.Item>
                    )}
                    {contactEmail && (
                        <Menu.Item href={contactURL()} onClick={evt => {
                            evt.preventDefault();
                            setContactVisible(true);
                        }}>
                            <Translate>Contact</Translate>
                        </Menu.Item>
                    )}
                    {(hasTOS || tosHTML) && (
                        <Menu.Item href={tosURL()} target="_blank" rel="noopener noreferrer" onClick={evt => {
                            if (tosHTML) {
                                evt.preventDefault();
                                setTermsVisible(true);
                            }
                        }}>
                            <Translate>Terms and Conditions</Translate>
                        </Menu.Item>
                    )}
                </div>
            </Sidebar>
            {contactEmail && (
                <Modal open={contactVisible}
                       size="tiny"
                       closeIcon
                       onClose={() => setContactVisible(false)}>
                    <Modal.Header>
                        <Translate>Contact</Translate>
                    </Modal.Header>
                    <Modal.Content>
                        <div>
                            <Translate>If you need support, you can contact the following email address:</Translate>
                        </div>
                        <div>
                            <a href={`mailto:${contactEmail}`}>
                                {contactEmail}
                            </a>
                        </div>
                    </Modal.Content>
                </Modal>
            )}
            {tosHTML && (
                <Modal open={termsVisible}
                       closeIcon
                       onClose={() => setTermsVisible(false)}>
                    <Modal.Header>
                        <Translate>Terms and Conditions</Translate>
                    </Modal.Header>
                    <Modal.Content>
                        <div dangerouslySetInnerHTML={{__html: tosHTML}} />
                    </Modal.Content>
                </Modal>
            )}
        </>
    );
}

SidebarMenu.propTypes = {
    isAdmin: PropTypes.bool.isRequired,
    isAdminOverrideEnabled: PropTypes.bool.isRequired,
    hasOwnedRooms: PropTypes.bool.isRequired,
    gotoMyBookings: PropTypes.func.isRequired,
    gotoBookingsInMyRooms: PropTypes.func.isRequired,
    gotoMyRoomsList: PropTypes.func.isRequired,
    gotoMyBlockings: PropTypes.func.isRequired,
    gotoRBAdminArea: PropTypes.func.isRequired,
    toggleAdminOverride: PropTypes.func.isRequired,
    visible: PropTypes.bool,
    onClickOption: PropTypes.func,
    hideOptions: PropTypes.objectOf(PropTypes.bool),
    hasTOS: PropTypes.bool.isRequired,
    tosHTML: PropTypes.string,
    helpURL: PropTypes.string.isRequired,
    contactEmail: PropTypes.string,
};

SidebarMenu.defaultProps = {
    visible: false,
    onClickOption: null,
    hideOptions: {},
    tosHTML: null,
    contactEmail: null,
};


export default connect(
    state => ({
        isAdmin: userSelectors.isUserRBAdmin(state),
        isAdminOverrideEnabled: userSelectors.isUserAdminOverrideEnabled(state),
        hasOwnedRooms: userSelectors.hasOwnedRooms(state),
        contactEmail: configSelectors.getContactEmail(state),
        helpURL: configSelectors.getHelpURL(state),
        hasTOS: configSelectors.hasTOS(state),
        tosHTML: configSelectors.getTOSHTML(state),
    }),
    dispatch => ({
        gotoMyBookings() {
            dispatch(globalActions.resetPageState('calendar'));
            dispatch(filtersActions.setFilters('calendar', {
                myBookings: true,
                hideUnused: true,
            }, false));
            dispatch(pushRoute('/calendar?my_bookings=true&hide_unused=true'));
        },
        gotoBookingsInMyRooms() {
            dispatch(globalActions.resetPageState('calendar'));
            dispatch(filtersActions.setFilters('calendar', {
                onlyMine: true,
                hideUnused: true,
            }, false));
            dispatch(pushRoute('/calendar?mine=true&hide_unused=true'));
        },
        gotoMyRoomsList() {
            dispatch(globalActions.resetPageState('roomList'));
            dispatch(filtersActions.setFilters('roomList', {onlyMine: true}, false));
            dispatch(pushRoute('/rooms?mine=true'));
        },
        gotoMyBlockings() {
            dispatch(globalActions.resetPageState('blockings'));
            dispatch(blockingsActions.setFilters({myBlockings: true}, false));
            dispatch(pushRoute('/blockings?my_blockings=true'));
        },
        gotoRBAdminArea() {
            dispatch(pushRoute('/admin'));
        },
        toggleAdminOverride() {
            dispatch(userActions.toggleAdminOverride());
        }
    })
)(Overridable.component('SidebarMenu', SidebarMenu));