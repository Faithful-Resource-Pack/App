export default {
  name: 'color-lab-toolbar',
  template: `
    <v-toolbar id="color-lab-toolbar" dense flat class="ma-2">
      <v-toolbar-title style="font-size: 15px; font-weight: normal; opacity: 0.8;">Press the space bar to generate color palettes !</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-dots-horizontal</v-icon>
      </v-btn>

      <v-divider vertical class="mx-4"></v-divider>

      <v-btn icon>
        <v-icon>mdi-camera</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-image</v-icon>
      </v-btn>

      <v-divider vertical class="mx-4"></v-divider>

      <v-btn icon>
        <v-icon>mdi-undo</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-redo</v-icon>
      </v-btn>

      <v-divider vertical class="mx-4"></v-divider>

      <v-btn icon>
        <v-icon>mdi-glasses</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-white-balance-sunny</v-icon>
      </v-btn>

      <v-divider vertical class="mx-4"></v-divider>

      <v-btn text>  
        <v-icon left>mdi-eye</v-icon> View
      </v-btn>

      <v-btn text>  
        <v-icon left>mdi-share-variant</v-icon> Export
      </v-btn>
    </v-toolbar>
  `
}