# PITCH Swiper

PITCH-swiper is a lightweight swiper component for Preact. Hopefully it should work with React out of the box. Tested on iPhone 8, Android HTC U11, Safari for Mac, Firefox and Chrome for Windows 7/10, Mac and Linux. The component is only 300 lines of code, no external dependencies, except for (p)react itself. This component was originally created for [Pitch app](http://www.pitchinvestorslive.com/) hence the name. We have tried multiple other components, but neither was fast, reliable, cool looking and configurable enough, so I have created this one.

It requires some work to set up, please see examples and read this README carefully.

[Simplest possible "hello world" demo](https://exebook.github.io/pitch-swiper/hello.html), source: [hello.html](https://github.com/exebook/pitch-swiper/blob/master/hello.html)

[More advanced demo](https://exebook.github.io/pitch-swiper/example.html), source: [example.html](https://github.com/exebook/pitch-swiper/blob/master/example.html)


# Usage

JSX version

```jsx
<AmberSwiper
	Card = {...}
	Background = {...}
	data = {...}
	on_dragstate = {...}
	on_card = {...}
	userData = {...}
	ref = {...}
})
```

## Properties

### Card

Your custom component for the card, render what it looks like and handles some events.

`Card.on_dragstate(new_dragout)` to track animation state.

`Card.on_dragbegin()` called on the first touch.

`Card.on_dragend(final_dragout)` called when the swiping action ends, the dragout indicates the result. Note that it could be zero, which means the card droped back to stack.

Use dimensions from `SwiperConfig` to `render()` it properly, i.e. `SwiperConfig.top` `SwiperConfig.width` etc.

### Background

You custom background component, define `render()` and handle events if you need.

Receives props: `data`, `number`, `userData`, `itemData`.

`Background.on_card(dragout)` called when swiping action was completed (but not when it was cancelled).

### Data

`data` - To put say 3 cards on the stack, you must provide `data` as an array of three items, for example `[1, 2, 3]` or `[{title:"one"},{title:"two"},{title:"three"}]`. Items can be anything you want, you will receive the array item in `render`s and in event handlers.



### Terminology

`itemData` - The element from `data` passed to a `Card` component as a prop.

`number` - Current card index in the data array


In case you need to hack into source code here is some terminology used in the source code:

`Stack` - The cards or rather their frames drawn under the top two actually visible cards

`Dragout bitmask` - Numeric representation of the swipe result that will be sent to your callbacks, possible values `0`: not dragged enough to get out, `1`: left, `2`: right, `4`: up, `8`: down, can be combined like left+up = `1+4` = `5`

### Note
This component uses absolute positioning, better used in full screen or carefully laid out DOM.
When you create AmberSwiper you need to provide the `data` property.


### SwiperConfig

A global variable thatmanages look and feel of the swiper. Change the properties in your initialization code. See the source for the list and description of settings.

