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

function domToObject() {
    const tabs = [];
    let anyErrorsFound = false;
    for (const row of document.querySelectorAll("#tabs-list > tr")) {
        const timeElement = row.querySelector(".tab-time input");
        if (timeElement.value === "") {
            timeElement.style.background = "red";
            anyErrorsFound = true;
        }
        
        const urlElement = row.querySelector(".tab-url input");
        let url = urlElement.value;
        if (url.indexOf("://") === -1) {
            url = "https://" + url;
        }
        try {
            new URL(url);
        } catch (e) {
            url = "";
        }
        if (url === "") {
            urlElement.style.background = "red";
            anyErrorsFound = true;
        }
        
        tabs.push({time: timeElement.value, url});
    }
    return anyErrorsFound ? null : tabs;
}

function objectToDom(tabs) {
    document.getElementById("tabs-list").replaceChildren();
    if (tabs.length === 0) {
        addRow();
        return;
    }
    
    for (const tab of tabs) {
        const {row, inputTime, inputUrl} = addRow();
        inputTime.value = tab.time;
        inputUrl.value = tab.url;
    }
}

function addRow() {
    const row = document.createElement("tr");
    
    const tdTime = document.createElement("td");
    tdTime.className = "tab-time";
    const inputTime = document.createElement("input");
    inputTime.type = "time";
    inputTime.addEventListener("input", (e) => {
        inputTime.style.background = "";
    });
    tdTime.appendChild(inputTime);
    row.appendChild(tdTime);
    
    const tdUrl = document.createElement("td");
    tdUrl.className = "tab-url";
    const inputUrl = document.createElement("input");
    inputUrl.addEventListener("input", (e) => {
        inputUrl.style.background = "";
    });
    tdUrl.appendChild(inputUrl);
    row.appendChild(tdUrl);
    
    const tdRemove = document.createElement("td");
    tdRemove.className = "tab-remove";
    const buttonRemove = document.createElement("button");
    buttonRemove.innerText = "X";
    buttonRemove.addEventListener("click", (e) => {
        row.remove();
    });
    tdRemove.appendChild(buttonRemove);
    row.appendChild(tdRemove);
    
    document.getElementById("tabs-list").appendChild(row);
    return {row, inputTime, inputUrl};
}

document.getElementById("add-button").addEventListener("click", (e) => {
    addRow();
});

document.getElementById("save-button").addEventListener("click", (e) => {
    const tabs = domToObject();
    if (tabs !== null) {
        browser.storage.local.set({tabs}).then(() => {
            objectToDom(tabs);
            e.target.innerText = "Saved!";
            e.target.style.background = "lime";
            setTimeout(() => {
                e.target.innerText = "Save";
                e.target.style.background = "";
            }, 1000);
        });
    }
});

browser.storage.local.get({tabs: []}).then(({tabs}) => objectToDom(tabs));
