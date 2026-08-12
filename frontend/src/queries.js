import { gql } from "@apollo/client";

const PERSON_DETAILS = gql`
  fragment PersonDetails on Person {
    name
    phone
    address {
      city
      street
    }
    id
  }
`;

export const CREATE_PERSON = gql`
  mutation createPerson(
    $name: String!
    $city: String!
    $street: String!
    $phone: String
  ) {
    addPerson(name: $name, city: $city, street: $street, phone: $phone) {
      name
      phone
      address {
        city
        street
      }
      id
    }
  }
`;

export const ALL_PERSONS = gql`
  query {
    allPersons {
      ...PersonDetails
    }
  }

  ${PERSON_DETAILS}
`;

export const FIND_PERSON = gql`
  query findPersonByName($name: String!) {
    findPerson(name: $name) {
      ...PersonDetails
    }
  }

  ${PERSON_DETAILS}
`;

export const PERSON_COUNT = gql`
  query {
    personCount
  }
`;

export const EDIT_PERSON = gql`
  mutation editPerson($name: String!, $phone: String!) {
    editPhone(name: $name, phone: $phone) {
      name
      phone
      id
      address {
        street
        city
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

export const ME = gql`
  query {
    me {
      username
    }
  }
`;

export const PERSON_ADDED = gql`
  subscription {
    personAdded {
      ...PersonDetails
    }
  }

  ${PERSON_DETAILS}
`;
