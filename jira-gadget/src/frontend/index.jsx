import React, { useEffect, useState } from "react";
import ForgeReconciler, {
  Text,
  useProductContext,
  Textfield,
  Form,
  Button,
  FormSection,
  FormFooter,
  Label,
  RequiredAsterisk,
  useForm,
  StackBarChart,
  Heading,
  Fragment,
  Table,
  Row,
  Cell,
  Link,
} from "@forge/react";
import { requestJira } from '@forge/bridge';

const arrayData = [
  ['Apple', 4, 'Dog'],
  ['Apple', 5, 'Cat'],
  ['Apple', 11, 'Horse'],
  ['Apple', 15, 'Elephant'],
  ['Banana', 5, 'Dog'],
  ['Banana', 10, 'Cat'],
  ['Banana', 14, 'Horse'],
  ['Banana', 10, 'Elephant'],
  ['Kumquat', 1, 'Dog'],
  ['Kumquat', 14, 'Cat'],
  ['Kumquat', 25, 'Horse'],
  ['Kumquat', 10, 'Elephant'],
  ['Dragonfruit', 5, 'Dog'],
  ['Dragonfruit', 2, 'Cat'],
  ['Dragonfruit', 5, 'Horse'],
  ['Dragonfruit', 8, 'Elephant'],
];

const fetchOpenIssues = async (projectKey) => {
  try {
    const jql = `project = ${projectKey} AND statusCategory != Done`;
    const response = await requestJira(`/rest/api/3/search?jql=${encodeURIComponent(jql)}`);

    if (!response.ok) {
      throw new Error(`Error fetching issues: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.issues;
    console.log(data.issues);
  } catch (error) {
    console.error(error);
    return [];
  }
};

const Chart = () => {
  return (
    <>
      <Text>test</Text>
      <StackBarChart
        data={arrayData}
        xAccessor={0}
        yAccessor={1}
        colorAccessor={2}
      />
    </>
  );
};

const OpenIssues = ({ projectKey }) => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const getIssues = async () => {
      const openIssues = await fetchOpenIssues(projectKey);
      setIssues(openIssues);
    };
    getIssues();
  }, [projectKey]);

  return <Text>test openissue</Text>;
};

const View = () => {
  return <Text>View Mode</Text>;
};

const App = () => {
  const context = useProductContext();
  if (!context) {
    return "Loading...";
  }

  return (
    <>
      <OpenIssues projectKey="KAN" />
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);