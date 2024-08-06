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
} from "@forge/react";
import { invoke, view } from "@forge/bridge";
import { StackBarChart } from '@forge/react';

const FIELD_NAME = "field-name";

const arrayData = [
  // in this example ['x value', 'y value', 'color value']
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
]

export const Test = () => {
  return (
    <>
      <Text>test</Text>
      <StackBarChart
        data={arrayData}
        xAccessor={0}
        yAccessor={1}
        colorAccessor={2}
      />;
    </>
  )
};


// export const Edit = () => {
//   return (
//     <Text>caner</Text>
//   );
// };
const View = () => {
  return <Text>View Mode</Text>;
};

const App = () => {
  const context = useProductContext();
  if (!context) {
    return "Loading...";
  }
  debugger;
  return context.extension.entryPoint === "edit" ? <Test /> : <View />;
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
