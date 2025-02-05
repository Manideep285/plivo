declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}

// Add any missing module declarations here
declare module 'react-chartjs-2' {
  export const Line: any;
  export const Bar: any;
  export const Pie: any;
  export const Doughnut: any;
}

// Add global type augmentations
declare global {
  interface Window {
    // Add any window augmentations here
    __INITIAL_STATE__?: any;
  }
}
