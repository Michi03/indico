# This file is part of Indico.
# Copyright (C) 2002 - 2025 CERN
#
# Indico is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see the
# LICENSE file for more details.

from indico.core import signals
from indico.core.notifications import email_sender, make_email
from indico.web.flask.templating import get_template_module


@email_sender
def notify_request(owner, blocking, blocked_rooms):
    """Notify room owner about blockings he has to approve.

    Expect only blockings for rooms owned by the specified owner.
    """
    with owner.force_user_locale():
        tpl = get_template_module('rb/emails/blockings/awaiting_confirmation_email_to_manager.txt',
                                  owner=owner, blocking=blocking, blocked_rooms=blocked_rooms)
        signals.core.before_notification_send.send('notify-rb-blocking-owner', owner=owner, blocking=blocking, blocked_rooms=blocked_rooms, template=tpl)
        return make_email(owner.email, template=tpl)


@email_sender
def notify_request_response(blocked_room):
    """
    Notify blocking creator about approval/rejection of his
    blocking request for a room.
    """
    user = blocked_room.blocking.created_by_user
    with user.force_user_locale():
        tpl = get_template_module('rb/emails/blockings/state_email_to_user.txt',
                                  blocking=blocked_room.blocking, blocked_room=blocked_room)
        signals.core.before_notification_send.send('notify-rb-blocking-user', user=user, blocking=blocked_room.blocking, blocked_room=blocked_room, template=tpl)
        return make_email(user.email, template=tpl)
