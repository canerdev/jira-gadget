import React, { useEffect, useState } from "react";
import ForgeReconciler, {
  Text,
  useProductContext,
  StackBarChart,
} from "@forge/react";
import { requestJira } from '@forge/bridge';

const arrayData = [
  ['pzt', 4, 'Dog'],
  ['pzt', 11, 'Horse'],
  ['pzt', 15, 'Elephant'],
  ['sali', 5, 'Dog'],
  ['sali', 10, 'Cat'],
  ['Kumquat', 25, 'Horse'],
  ['Kumquat', 10, 'Elephant'],
  ['Dragonfruit', 2, 'Cat'],
  ['Dragonfruit', 5, 'Horse'],
  ['Dragonfruit', 8, 'Elephant'],
];

const FetchOpenIssues = async (projectKey) => {
  try {
    const jql = `project = ${projectKey} AND statusCategory != Done`;
    const response = await requestJira(`/rest/api/3/search?jql=${encodeURIComponent(jql)}`);

    if (!response.ok) {
      throw new Error(`Error fetching issues: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // console.log(data.issues);
    return data.issues;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const data1 = [];

(async function extractData() {
  console.log("extract data function");

  const projectKey = "KAN";
  const issues = await FetchOpenIssues(projectKey); // Ensure this function is defined

  console.log(issues);
  let idx = 0;
  for (let i = 0; i < issues.length; i++) {
    for (let j = 0; j < issues[i].fields.labels.length; j++) {
      data1.push([idx, i + j, issues[i].fields.labels[j]]);
      console.log("inside inner loop");
      idx++;
    }
  }

  console.log(data1);
})();



const Chart = () => {
  console.log("chart component");
  console.log(data1);
  console.log(arrayData)
  return (
    <>
      <Text>test</Text>
      <StackBarChart
        data={data1}
        xAccessor={0}
        yAccessor={1}
        colorAccessor={2}
      />
    </>
  );
};

// const OpenIssues = ({ projectKey }) => {
//   const [issues, setIssues] = useState([]);

//   useEffect(() => {
//     const getIssues = async () => {
//       const openIssues = await fetchOpenIssues(projectKey);
//       setIssues(openIssues);
//     };
//     getIssues();
//   }, [projectKey]);
// };

const View = () => {
  return <Text>View Mode</Text>;
};

const App = () => {
  const context = useProductContext();
  if (!context) {
    return "Loading...";
  }

  return (
    <Chart />
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);