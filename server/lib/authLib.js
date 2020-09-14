/**
 * Copyright (c) 2019 OVTeam
 * Modified By: Huy Nghiem
 * Modified Date: 2019/11/12
 */
'use strict';
let User = require("./../data/userModel");
let MailLog = require("../data/maillog");
let { resetPassword } = require("../handles/authHandle");
let { AuthKeys } = require("./constants");
let { checkCaseInsensitive } = require("./../utils/ovutility");
let scheduleEmail = false;

function stopSchedule() {
    clearTimeout(scheduleEmail);
    scheduleEmail = false;
}

function getScheduleMailUser() {
    return new Promise(function (resolve, reject) {
        if (scheduleEmail) {
            resolve({});
            return;
        }
        
        User.find({
            locked: true, isresetpsw: true
        }).sort({ lastmodified: 1 }).limit(1)
            .exec(function (err, docs) {
                if (docs.length) {
                    MailLog.find({
                        loginname: checkCaseInsensitive(docs[0].loginname)
                    }).sort({ lastmodified: -1 }).limit(1)
                        .exec(function (err, maillogs) {
                            if (maillogs.length) {
                                let currentTime = new Date().getTime(),
                                    lockedTime = Date.parse(maillogs[0].lastmodified),
                                    currentMilisecond = currentTime - lockedTime;
                                if (currentMilisecond <= AuthKeys.AUTO_TIMEOUT) {
                                    scheduleEmail = setTimeout(() => {
                                        resetPassword(docs[0].loginname, 'system_auto', docs[0].requesttime, function (res) {
                                            // Write to Log auto send mail
                                            stopSchedule();
                                            getScheduleMailUser();
                                        });
                                    }, AuthKeys.AUTO_TIMEOUT - currentMilisecond);
                                } else {
                                    resetPassword(docs[0].loginname, 'system_auto', docs[0].requesttime, function (res) {
                                        // Write to Log auto send mail
                                        getScheduleMailUser();
                                    });
                                }
                            } else {
                                getScheduleMailUser();
                            }
                        });
                } else {
                    resolve({})
                }
            });
        
    });
}

exports.getScheduleMailUser = getScheduleMailUser;