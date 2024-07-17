function loader(source) {
  // The goal is to disregard any SCSS / CSS imports
  // and return empty source for any client components found
  console.log('this', this)
  // console.log('Issuer Layer', this.issuerLayer)
  console.log('Processing file with my-custom-loader:', this.resourcePath)

  return source
}

export default loader
