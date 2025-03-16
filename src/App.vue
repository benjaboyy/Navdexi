<template>
  <k-app theme="ios">
    <k-page>
      <k-navbar title="My Konsta App" />
      <k-block strong>Hello world!</k-block>
    </k-page>
  </k-app>
</template>

<script>
import { kApp, kPage, kNavbar, kBlock } from 'konsta/vue';

export default {
  components: {
    kApp,
    kPage,
    kNavbar,
    kBlock,
  },
};
</script>
