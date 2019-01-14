#PITCH Swiper



#Terminology

Swiper - The whole component
TopCard - The component that represends the top card, controls the animation and events
Stack - The cards or rather their frames drawn under the top two actually visible cards
Dragout - Numeric representation of the swipe result, see calculateDragout for details
data - Data is an array of anything you want, you will receive the array item when events happen with the associated card. You will also use the array data to render your Card or Background components.
userData - Some arbitrary variable that will be passed to back you as props
itemData - The element from data
number - Current card index in the data array

#Usage

### Usage
```js
h(AmberSwiper, {
	Card: <Your custom card component>,
	Background: <Your component that will be draw behind (and possibly around) the cards>,
	data: <Array of cards data>,
	on_dragstate: <Callback to track animation state>,
	on_card: <Callback fires when the card finished swiping and is out of stack, probably the one you need most>,
	userData: <Your arbitrary data passed as property to your Background and Card>,
	ref: x =>{ this.swiper = x }, // You might need this if you want to have advanced dynamic control of swiper
})
```

###Note
This component uses absolute positioning, better used in full screen or carefully laid out DOM.
When you create AmberSwiper you need to provide the `data` property.


###Background

Render it using config.top config.width etc
Receives props: data, number, userData, itemData

###Card

Use dimensions from config to render it properly.
Card can define these methods as callbacks:
on_dragstate(new_dragout) to track animation state
on_dragbegin() called on the first touch
on_dragend(final_dragout) called when the swiping action ends, the dragout indicates the result. Note that it could be zero, which means the card droped back to stack.

SwiperConfig

Please read the