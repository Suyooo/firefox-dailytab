/*
 * Copyright 2023 Suyooo
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function setUp() {
    browser.alarms.create("dailytab-check-interval", {
        periodInMinutes: 1
    });
    check();
}
browser.runtime.onInstalled.addListener(setUp);
browser.runtime.onStartup.addListener(setUp);

function check() {
    const checkTime = Date.now();
    browser.storage.local.get({tabs: [], lastCheckTime: checkTime})
        .then(({tabs, lastCheckTime}) => {
            for (const tab of tabs) {
                let lastOpenTime = new Date();
                const [h,m] = tab.time.split(":");
                lastOpenTime.setHours(h);
                lastOpenTime.setMinutes(m);
                lastOpenTime.setSeconds(0);
                while (lastOpenTime > checkTime) {
                    lastOpenTime.setDate(lastOpenTime.getDate() - 1);
                }
                
                if (lastOpenTime >= lastCheckTime) {
                    try {
                        browser.tabs.create({
                            url: tab.url,
                            title: !tab.preload ? "[Daily Tab] " + tab.url : undefined,
                            active: false,
                            discarded: !tab.preload
                        });
                    } catch (e) {
                        // Firefox Android does not support active/discarded
                        // So in case of an error, that might be the cause
                        // Retry without the properties then...
                        browser.tabs.create({
                            url: tab.url
                        });
                    };
                }
            }
            browser.storage.local.set({lastCheckTime: checkTime});
        });
}
browser.alarms.onAlarm.addListener((alarmInfo) => {
    if (alarmInfo.name === "dailytab-check-interval") check();
})
