declare module 'react-vega' {
  import { Component } from 'react';

  export interface VegaEmbedProps {
    spec: any;
    options?: any;
    onNewView?: (view: any) => void;
  }

  export class VegaEmbed extends Component<VegaEmbedProps> {}
}
