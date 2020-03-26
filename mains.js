// Classes
class Complex {
	constructor(re = 0, im = 0) {
		this.re = re
		this.im = im
	}

	plus(complex) {
		return new Complex(this.re + complex.re, this.im + complex.im)
	}

	times(complex) {
		return new Complex(this.re * complex.re - this.im * complex.im, this.re * complex.im + this.im * complex.re)
	}

	power(exponent) {
		if (exponent === 0) return new Complex(1, 0)
		if (exponent === 1) return this

		let complex = this
		for (let i = 1; i < exponent; i++) {
			complex = complex.times(this)
		}
		return complex
	}

	color(dist = 10, limit = 10) {
		let complex = new Complex(0, 0)
		for (let k = 0; k < limit; k++) {
			complex = complex.power(2).plus(this)
			if (complex.norm > dist)
				return settings.color
					? [(3 * k) % 256, k % 256, (6 * k) % 256, 255]
					: settings.dark
					? [51, 51, 51, 255]
					: [221, 221, 221, 255]
		}
		return settings.color ? [0, 0, 0, 255] : settings.dark ? [221, 221, 221, 255] : [51, 51, 51, 255]
	}

	get norm() {
		return (this.re ** 2 + this.im ** 2) ** (1 / 2)
	}

	get display() {
		if (!this.re && !this.im) return '0'
		const sign = this.im < 0 ? '-' : '+'
		let im = Math.abs(this.im)
		if (im === 1) {
			im = ''
		}
		if (this.re) {
			if (this.im) {
				const sign = this.im < 0 ? '-' : '+'
				return `${this.re} ${sign} ${im}i`
			} else {
				return `${this.re}`
			}
		} else {
			return `${sign}${im}`
		}
	}
}

// Canvas
const canvas = document.getElementById('main-canvas')
const ctx = canvas.getContext('2d')

// Default Settings
let settings = {
	dark: true,
	color: true,
	axis: true,
	// center: { x0: -0.16, y0: 1.0374 }, <= use this setting if you want to see beautiful things ;)
	// zoom: 500000
	center: { x0: -0.5, y0: 0 },
	zoom: 1
}

const initialSettings = { ...settings }

let deltaX = 3
let deltaY = -3

// Functions
const point = (x, y, color = '#000') => {
	ctx.fillStyle = color
	ctx.fillRect(x, y, 1, 1)
}

const setDimensions = () => {
	ctx.canvas.width = window.innerWidth
	ctx.canvas.height = window.innerHeight

	// // Updating deltaX/deltaY according to screen ratio, center and zoom
	const { width, height } = ctx.canvas
	const ratio = width / height

	if (ratio >= 1) {
		deltaX = (3 * ratio) / settings.zoom
		deltaY = -3 / settings.zoom
	} else {
		deltaX = 3 / settings.zoom
		deltaY = -3 / ratio / settings.zoom
	}
}

const complexFromCoords = (x, y) => {
	const { width, height } = ctx.canvas

	const re = (deltaX * x) / width - deltaX / 2 + settings.center.x0
	const im = (deltaY * y) / height - deltaY / 2 + settings.center.y0

	return new Complex(re, im)
}

const draw = () => {
	const loading = document.getElementById('loading')
	const splash = document.getElementById('splash')
	loading.classList.remove('hidden')

	setTimeout(() => {
		setDimensions()

		const { width, height } = ctx.canvas
		ctx.clearRect(0, 0, width, height)
		const imageData = ctx.createImageData(width, height)
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const color = complexFromCoords(x, y).color(20, 500)
				imageData.data[4 * (y * width + x)] = color[0]
				imageData.data[4 * (y * width + x) + 1] = color[1]
				imageData.data[4 * (y * width + x) + 2] = color[2]
				imageData.data[4 * (y * width + x) + 3] = color[3]
			}
		}
		ctx.putImageData(imageData, 0, 0)
		loading.classList.add('hidden')
		splash.classList.add('remove')
	}, 10)
}

// Events
document.getElementById('open-settings').addEventListener('click', () => {
	document.getElementById('settings').classList.remove('hidden')
})

document.getElementById('close-settings').addEventListener('click', () => {
	document.getElementById('settings').classList.add('hidden')
})

document.getElementById('settings-form').addEventListener('submit', (e) => {
	e.preventDefault()
	console.log(document.getElementById('dark').value, document.getElementById('color').value)
	settings = {
		...settings,
		dark: document.getElementById('dark').checked,
		color: document.getElementById('color').checked,
		center: {
			x0: +document.getElementById('center-x').value,
			y0: +document.getElementById('center-y').value
		},
		zoom: +document.getElementById('zoom').value
	}
	draw()
})

document.getElementById('reset').addEventListener('click', () => {
	settings = { ...initialSettings }
	draw()
})

document.getElementById('save').addEventListener('click', (e) => {
	e.preventDefault()
	imageURI = canvas.toDataURL()
	const link = document.createElement('a')
	link.setAttribute('href', imageURI)
	link.setAttribute('download', 'mandelbrot')
	link.click()
})

window.addEventListener('keyup', (e) => {
	switch (e.which) {
		case 83:
			document.getElementById('settings').classList.toggle('hidden')
	}
})

// Loading screen

// Launch app
window.addEventListener('load', () => {
	draw()
})
