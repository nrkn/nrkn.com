type RecordArg = {
  style?: CSSStyleDeclaration
  data?: Record<string,string>
  [ string ]: any
}

type Arg = Node | string | RecordArg

export declare const h: {
  <K extends keyof HTMLElementTagNameMap>( name: K, ...args: Arg[] ): HTMLElementTagNameMap[ K ]
  ( name: string, ...args: Arg[] ): Element
}

export declare const s: {
  <K extends keyof SVGElementTagNameMap>( name: K, ...args: Arg[] ): SVGElementTagNameMap[ K ]
  ( name: string, ...args: Arg[] ): Element
}

export declare const select: {
  <K extends keyof HTMLElementTagNameMap>( name: K, parent?: Element ): HTMLElementTagNameMap[ K ]
  <K extends keyof SVGElementTagNameMap>( name: K, parent?: Element ): SVGElementTagNameMap[ K ]
  ( name: string, parent?: Element ): Element
}

export declare const attr: {
  <T extends Element>( el: T, ...args: Arg[] ): T
}