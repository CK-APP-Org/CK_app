// Ensure you export both functions correctly
export async function fetchXMLData(url) {
  const response = await fetch(`/api${url}`);
  const xmlText = await response.text();
  console.log("1");
  console.log(xmlText); // Log the fetched XML data
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");
  return xmlDoc;
}

export function parseXMLData(xmlDoc) {
  const items = xmlDoc.querySelectorAll("item");
  const data = Array.from(items).map((item) => ({
    title: item.querySelector("title").textContent,
    pubDate: item.querySelector("pubDate").textContent,
  }));
  console.log("2");
  console.log(data); // Log the parsed data
  return data;
}
