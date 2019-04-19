#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const filename = path.resolve(process.argv[2])
const exec = require('child_process').exec

fs.readFile(filename, 'utf8', (err,source)=>{
	if (err) {
		console.log(err)
		process.exit(1)
	}

	const extname = path.extname(filename)
	if(extname !== '.md'){
		console.log('not a markdown file')
		process.exit(1)
	}

	const basename = path.basename(filename,extname)

	const md_lines = []
	const dot_lines = []
	let is_open = false
	let svg_idx = 1

	source.split(/\r\n|\n/).forEach(line=>{
		if(is_open) {
			if(line.startsWith('```')) {
				//dot file source
				const dot_src = dot_lines.join('\n')
				const svg_name = `${basename}-${svg_idx}.svg`
				const svg_path = path.resolve(svg_name)

				//temp dot file
				const temp_dot_name = `${basename}-temp${svg_idx}.dot`
				const temp_dot_path = path.resolve(temp_dot_name)
				fs.writeFileSync(temp_dot_path, dot_src, 'utf8')

				//add img tag
				const image_tag = `![](./${svg_name})`
				md_lines.push(image_tag)
				
				//clean up
				dot_lines.length = 0

				//generate svg
				const cmd = `dot -Tsvg ${temp_dot_path} -o ${svg_path}`
				exec(cmd,()=>{
					fs.unlinkSync(temp_dot_path)
				})

				is_open = false
			} else {
				//collect dot lines
				dot_lines.push(line)
			}
		} else {
			if(line.startsWith('```dot')){
				is_open = true
			} else {
				md_lines.push(line)
			}
		}
	})

	//write output
	console.log(md_lines.join('\n'))
})

// find embeded dot graphs (codes between ```dot & ```)


// convert them into .svg files
// combine them into a .md file



