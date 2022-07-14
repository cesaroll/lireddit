import React from 'react'
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useMeQuery } from '../generated/graphql';

interface NavBarProps {
}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{data, fetching}] = useMeQuery();
  let body = null;

  if (fetching) { // data is loading

  } else if (!data?.me) { // user not logged in

  } else { // user is logged in

  }

  return (
    <Flex bg="teal" p={4}>
      <Box ml={'auto'}>
        {
          !fetching && !data?.me && // user not logged in
          <>
            <NextLink href="/login">
              <Link color="white" mr={2}>login</Link>
            </NextLink>
            <NextLink href="/register">
              <Link color="white">register</Link>
            </NextLink>
          </>

        }
        {
          !fetching && data?.me && // user is logged in
          <Flex>
            <Box color="white" mr={2}>{data.me.userName}</Box>
            <Button color="white" variant="link">logout</Button>
          </Flex>
        }
      </Box>
    </Flex>
  );
};

export default NavBar;
