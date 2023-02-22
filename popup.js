let spinner = document.querySelector(".spinner");
let scrapeDataButton = document.getElementById("scrape");
let list = document.getElementById("dataList");
let saveDataButton = document.getElementById("saveDataButton");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let data = request.productTitle;
  if (data === null || data.length === 0) {
    let div = document.createElement("li");
    div.innerText = "No data Found";
    list.appendChild(div);
  } else {
    data.forEach((d) => {
      let div = document.createElement("li");
      div.innerText = d;
      list.appendChild(div);
      saveDataButton.classList.remove("hidden");
    });
  }
});

scrapeDataButton.addEventListener("click", async () => {
  // Show the spinner
  spinner.style.display = "block";

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: ScrapeDataFromPage,
    },
    () => {
      // Hide the spinner after 2 seconds
      setTimeout(() => {
        spinner.style.display = "none";
      }, 500);
    }
  );
});

function ScrapeDataFromPage() {
  let elements = document.querySelectorAll(
    ".a-size-medium.a-color-base.a-text-normal"
  );
  let data = [];
  elements.forEach((element) => {
    data.push(element.textContent);
  });
  chrome.runtime.sendMessage({ productTitle: data });
}

saveDataButton.addEventListener("click", () => {
  let csvContent = "data:text/csv;charset=utf-8,";
  list.querySelectorAll("li").forEach((li) => {
    csvContent += li.innerText + "\n";
  });
  let encodedUri = encodeURI(csvContent);
  let link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "data.csv");
  document.body.appendChild(link);
  link.click();
});
