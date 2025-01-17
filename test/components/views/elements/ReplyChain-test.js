/*
Copyright 2021 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import "../../../skinned-sdk";
import * as testUtils from '../../../test-utils';
import { getParentEventId } from "../../../../src/utils/Reply";

describe("ReplyChain", () => {
    describe('getParentEventId', () => {
        it('retrieves relation reply from unedited event', () => {
            const originalEventWithRelation = testUtils.mkEvent({
                event: true,
                type: "m.room.message",
                content: {
                    "msgtype": "m.text",
                    "body": "> Reply to this message\n\n foo",
                    "m.relates_to": {
                        "m.in_reply_to": {
                            "event_id": "$qkjmFBTEc0VvfVyzq1CJuh1QZi_xDIgNEFjZ4Pq34og",
                        },
                    },
                },
                user: "some_other_user",
                room: "room_id",
            });

            expect(getParentEventId(originalEventWithRelation))
                .toStrictEqual('$qkjmFBTEc0VvfVyzq1CJuh1QZi_xDIgNEFjZ4Pq34og');
        });

        it('retrieves relation reply from original event when edited', () => {
            const originalEventWithRelation = testUtils.mkEvent({
                event: true,
                type: "m.room.message",
                content: {
                    "msgtype": "m.text",
                    "body": "> Reply to this message\n\n foo",
                    "m.relates_to": {
                        "m.in_reply_to": {
                            "event_id": "$qkjmFBTEc0VvfVyzq1CJuh1QZi_xDIgNEFjZ4Pq34og",
                        },
                    },
                },
                user: "some_other_user",
                room: "room_id",
            });

            const editEvent = testUtils.mkEvent({
                event: true,
                type: "m.room.message",
                content: {
                    "msgtype": "m.text",
                    "body": "> Reply to this message\n\n * foo bar",
                    "m.new_content": {
                        "msgtype": "m.text",
                        "body": "foo bar",
                    },
                    "m.relates_to": {
                        "rel_type": "m.replace",
                        "event_id": originalEventWithRelation.event_id,
                    },
                },
                user: "some_other_user",
                room: "room_id",
            });

            // The edit replaces the original event
            originalEventWithRelation.makeReplaced(editEvent);

            // The relation should be pulled from the original event
            expect(getParentEventId(originalEventWithRelation))
                .toStrictEqual('$qkjmFBTEc0VvfVyzq1CJuh1QZi_xDIgNEFjZ4Pq34og');
        });

        it('retrieves relation reply from edit event when provided', () => {
            const originalEvent = testUtils.mkEvent({
                event: true,
                type: "m.room.message",
                content: {
                    msgtype: "m.text",
                    body: "foo",
                },
                user: "some_other_user",
                room: "room_id",
            });

            const editEvent = testUtils.mkEvent({
                event: true,
                type: "m.room.message",
                content: {
                    "msgtype": "m.text",
                    "body": "> Reply to this message\n\n * foo bar",
                    "m.new_content": {
                        "msgtype": "m.text",
                        "body": "foo bar",
                        "m.relates_to": {
                            "m.in_reply_to": {
                                "event_id": "$qkjmFBTEc0VvfVyzq1CJuh1QZi_xDIgNEFjZ4Pq34og",
                            },
                        },
                    },
                    "m.relates_to": {
                        "rel_type": "m.replace",
                        "event_id": originalEvent.event_id,
                    },
                },
                user: "some_other_user",
                room: "room_id",
            });

            // The edit replaces the original event
            originalEvent.makeReplaced(editEvent);

            // The relation should be pulled from the edit event
            expect(getParentEventId(originalEvent))
                .toStrictEqual('$qkjmFBTEc0VvfVyzq1CJuh1QZi_xDIgNEFjZ4Pq34og');
        });

        it('prefers relation reply from edit event over original event', () => {
            const originalEventWithRelation = testUtils.mkEvent({
                event: true,
                type: "m.room.message",
                content: {
                    "msgtype": "m.text",
                    "body": "> Reply to this message\n\n foo",
                    "m.relates_to": {
                        "m.in_reply_to": {
                            "event_id": "$111",
                        },
                    },
                },
                user: "some_other_user",
                room: "room_id",
            });

            const editEvent = testUtils.mkEvent({
                event: true,
                type: "m.room.message",
                content: {
                    "msgtype": "m.text",
                    "body": "> Reply to this message\n\n * foo bar",
                    "m.new_content": {
                        "msgtype": "m.text",
                        "body": "foo bar",
                        "m.relates_to": {
                            "m.in_reply_to": {
                                "event_id": "$999",
                            },
                        },
                    },
                    "m.relates_to": {
                        "rel_type": "m.replace",
                        "event_id": originalEventWithRelation.event_id,
                    },
                },
                user: "some_other_user",
                room: "room_id",
            });

            // The edit replaces the original event
            originalEventWithRelation.makeReplaced(editEvent);

            // The relation should be pulled from the edit event
            expect(getParentEventId(originalEventWithRelation)).toStrictEqual('$999');
        });

        it('able to clear relation reply from original event by providing empty relation field', () => {
            const originalEventWithRelation = testUtils.mkEvent({
                event: true,
                type: "m.room.message",
                content: {
                    "msgtype": "m.text",
                    "body": "> Reply to this message\n\n foo",
                    "m.relates_to": {
                        "m.in_reply_to": {
                            "event_id": "$111",
                        },
                    },
                },
                user: "some_other_user",
                room: "room_id",
            });

            const editEvent = testUtils.mkEvent({
                event: true,
                type: "m.room.message",
                content: {
                    "msgtype": "m.text",
                    "body": "> Reply to this message\n\n * foo bar",
                    "m.new_content": {
                        "msgtype": "m.text",
                        "body": "foo bar",
                        // Clear the relation from the original event
                        "m.relates_to": {},
                    },
                    "m.relates_to": {
                        "rel_type": "m.replace",
                        "event_id": originalEventWithRelation.event_id,
                    },
                },
                user: "some_other_user",
                room: "room_id",
            });

            // The edit replaces the original event
            originalEventWithRelation.makeReplaced(editEvent);

            // The relation should be pulled from the edit event
            expect(getParentEventId(originalEventWithRelation)).toStrictEqual(undefined);
        });
    });
});
