//import { render, h, Component } from 'preact'
var { render, h, Component } = window.preact

export var SwiperConfig = {
	// Behavior

	// how much of element width to drag to get out
	outdragFactorLeft: 0.03,
	outdragFactorRight: 0.03,
	outdragFactorTop: 0.7, // make veryhard to drag over the top, set to 10+ to make it impossible
	outdragFactorBottom: 0.3,

	// Positioning
	top: 40,  // __must__ be in pixels or the math will fail
	left: 70,
	width: 200,
	height: 300,

	// Card design
	cardPosition: 'fixed', // can be 'absolute'
	cardShade: 'rgb(240,243,234)',
	cardBorderRadius: '3mm',
	cardBorderLight: '0px solid #998',
	cardBorderDark: '1.1px solid #662',

	// Card being swiped (when it moves)
	cardOpacity: 0.9,
	swipeShadow: '0px 15px 30px rgba(0,.5,.0,0.5)',

	// Stack drawing
	stackBorder: '0.5px dotted #663',
	stackMax: 8,
	stackStep: 0.7,
	stackRotation: 7,
	stackStepX: 0.9,
	stackStepY: 1.8,
	stackShadowColor: 'rgba(.5,.5,.0,0.5)',
}

export function freezeElement(el, freeze) {
	// An utility to make text non selecable
	if (freeze) {
		el.style.userSelect = 'none'
		el.style['-moz-user-select'] = 'none'
	}
	else {
		el.style.userSelect = null
		el.style['-moz-user-select'] = null
	}
}

function animateElement(el, start) {
	freezeElement(el, start)
	// disable the cards content and apply styles effective during animation
	if (start) {
		el.style.opacity = SwiperConfig.cardOpacity
		el.style.boxShadow = SwiperConfig.swipeShadow
	}
	else {
		el.style.opacity = 1
		el.style.boxShadow = null
		el.style.transform = null
	}
}

function calculateDragout(state) {
	// returns bitmask: 0: not dragged enough to get out
	// 1: left, 2: right, 4: up, 8: down, combine like left-up = 1+4 = 5

	var outdragLeft = SwiperConfig.outdragFactorLeft * state.width
	var outdragRight = SwiperConfig.outdragFactorRight * state.width
	var outdragTop = SwiperConfig.outdragFactorTop * state.width
	var outdragBottom = SwiperConfig.outdragFactorBottom * state.width
	var bitmask = 0
	if (state.left < state.startX - outdragLeft) bitmask += 1
	if (state.left > state.startX + outdragRight) bitmask += 2
	if (state.top < state.startY - outdragTop) bitmask += 4
	if (state.top > state.startY + outdragBottom) bitmask += 8
	return { bitmask, outdrag: state.left - state.startX }
}

export function DrawStacks(stackSize) {
	// Draw cards edges that represent the stack under our visible two cards.
	if (stackSize > SwiperConfig.stackMax) stackSize = SwiperConfig.stackMax

	function Stack(props) {
		// draw stack depending on number of cards left
		var StackStyle = {
			position: 'absolute',
			width: SwiperConfig.width,
			height: SwiperConfig.height,
			left: SwiperConfig.left + props.i * SwiperConfig.stackStepX,
			top: SwiperConfig.top + props.i * SwiperConfig.stackStepY,
			borderRadius: SwiperConfig.cardBorderRadius,
			backgroundColor: SwiperConfig.cardShade,
			border: SwiperConfig.stackBorder,
			zIndex: 1002,
		}

		if (SwiperConfig.stackRotation != undefined) {
			StackStyle.transform = `rotate(${props.i/SwiperConfig.stackRotation}deg)`
		}

		if (props.last == true && SwiperConfig.stackShadowColor != undefined) {
			var X = stackSize * SwiperConfig.stackStepX*1.1
			var Y = stackSize * SwiperConfig.stackStepY*1.1
			StackStyle.boxShadow = `${X}px ${Y}px 10px `+SwiperConfig.stackShadowColor
		}

		return h('div', { style: StackStyle })
	}

	if (stackSize <= 1) return []
	var R = []
	for (var i = stackSize; i >= 0; i -= SwiperConfig.stackStep) {
		R.push(i)
	}
	for (var i = 0; i < R.length; i++) {
		R[i] = h(Stack, { i: R[i], last: i == R.length - 1 })
	}

	return R
}

class TopCard extends Component {
	constructor(props) {
		super(props)
		this.touch = this.touch.bind(this)
		this.move = this.move.bind(this)
		this.release = this.release.bind(this)
		this.getCurrentDragout = this.getCurrentDragout.bind(this)
	}

	getCurrentDragout() {
		var top = parseInt(this.base.style.top)
		var left = parseInt(this.base.style.left)
		var width = this.base.clientWidth
		var height = this.base.clientHeight
		var { startX, startY } = this.track
		return calculateDragout({ top, left, width, height, startX, startY })
	}

	touch(e) {
		this.track = {
			dragout: 0,
			holdX: e.pageX,
			holdY: e.pageY,
			startX: parseInt(this.base.style.left),
			startY: parseInt(this.base.style.top),
		}
		if (this.userComponent.on_dragbegin) {
			animateElement(this.base, true)
			this.userComponent.on_dragbegin()

		}
		if (this.userComponent.on_dragstate) {
			this.userComponent.on_dragstate(0, -1)
		}
	}

	move(e) {
		var S = this.base.style
		S.cursor = 'grabbing'
		S.left = (parseInt(S.left) + e.pageX - this.track.holdX) + 'px'
		S.top = (parseInt(S.top) + e.pageY - this.track.holdY) + 'px'

		this.track.holdX = e.pageX
		this.track.holdY = e.pageY
		var calc = this.getCurrentDragout()

		this.base.style.transform = `rotate(${calc.outdrag/15}deg)`
		var new_dragout = calc.bitmask
		if (new_dragout != this.track.dragout) {
			if (this.props.on_dragstate) {
				this.props.on_dragstate(new_dragout, this.track.dragout)
			}
			if (this.userComponent.on_dragstate) {
				this.userComponent.on_dragstate(new_dragout, this.track.dragout)
			}
			this.track.dragout = new_dragout
		}
	}

	release() {
		animateElement(this.base, false)
		var S = this.base.style
		S.cursor = 'auto'
		var dragout = this.getCurrentDragout().bitmask
		if (dragout == 0) {
			S.left = this.track.startX
			S.top = this.track.startY
		}
		else {
			this.props.nextcard(dragout)
		}
		this.track = undefined
		if (this.userComponent.on_dragend) {
			this.userComponent.on_dragend(dragout)
		}
	}

	render() {
		var Card = h(this.props.Card, {
			data: this.props.data,
			itemData: this.props.itemData,
			userData: this.props.userData,
			number: this.props.number,
			ref: x =>{ this.userComponent = x },
		})

		return h('div', {
			ontouchstart: e =>{
				this.touch(e.touches[0])
			},
			onmousedown: e =>{
				e.preventDefault()
				this.touch(e)
			},
			onmousemove: e =>{
				if (this.track) this.move(e)
			},
			ontouchmove: e =>{
				e.preventDefault()
				if (this.track) this.move(e.touches[0])
			},
			onmouseup: e =>{
				if (this.track) this.release(e)
			},
			ontouchend: e =>{
				if (this.track) this.release(e.touches[0])
			},
			onmouseleave: e =>{
				if (this.track) this.release(e)
			},
			style: {
				'background-image': `linear-gradient(290deg, ${SwiperConfig.cardShade}, white, white)`,
				borderRadius: SwiperConfig.cardBorderRadius,
				borderTop: SwiperConfig.cardBorderLight,
				borderLeft: SwiperConfig.cardBorderLight,
				borderRight: SwiperConfig.cardBorderDark,
				borderBottom: SwiperConfig.cardBorderDark,
				width: SwiperConfig.width,
				height: SwiperConfig.height,
				cursor: 'auto',
				position: SwiperConfig.cardPosition,
				top: SwiperConfig.top,
				left: SwiperConfig.left,
				zIndex: 1003,
			},
		}, Card)
	}
}

export class AmberSwiper extends Component {
	constructor(props) {
		super(props)
		this.nextcard = this.nextcard.bind(this)
		this.state = {
			current: 0,
		}
	}

	nextcard(bitmask) {
		if (this.background.on_card) {
			this.background.on_card(bitmask, this.state.current, this.props.data[this.state.current], this.props.data)
		}
		this.setState({ current: this.state.current + 1 })
	}

	render() {
		var Make = N => {
			if (N >= this.props.data.length) {
				return h('div', {}, '')
			}
			return h(TopCard, {
				itemData: this.props.data[N],
				data: this.props.data,
				key: N,
				Card: this.props.Card,
				number: N,
				on_dragstate: this.props.on_dragstate,
				nextcard: this.nextcard,
				userData: this.props.userData,
			})
		}

		return h('div', {},
			Make(this.state.current + 1),
			Make(this.state.current),
			h(this.props.Background,
				{
					ref: e => {
						this.background = e
					},
					data: this.props.data,
					number: this.state.current,
					itemData: this.props.data[this.state.current],
					userData: this.props.userData,
				}
			),
			DrawStacks(this.props.data.length - this.state.current),
		)
	}
}

