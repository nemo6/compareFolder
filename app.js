var path   = require('path')
var fs     = require('fs')
var _      = require('lodash')
var colors = require('colors')

function walk_csv(dir,table=[]) {

	let list = fs.readdirSync(dir)

	list.forEach( file => {
		
		pathx = dir + '\\' + file
		
		let stats = fs.statSync(pathx)

		if ( stats.isFile() ) {

			table.push( { pathx, "size" : stats.size } )

		} else if ( stats.isDirectory() ){

			table.push({pathx})

			walk_csv(pathx,table)
		}
		
	})

	return table

}

function csvToJson(x){

	obj = {}

	for( y of x ){

		[obj,...y.pathx.split("\\")].reduce( (o,x,i,arr) => {

			if( y.hasOwnProperty("size") && i == arr.length-1 ){

			o[x] = y.size

			}

			else if( o[x] == undefined )
			o[x] = {}

			return o[x]

		})
	}

	return obj
}

function rec(x,dir,obj={"str":""},i=0,table=[]){

	for ( y of Object.keys(x) ) {

		local_path = table.join("\\")+"\\"+y

		if ( typeof x[y] != 'object' ){

			if( diff_size.includes( local_path ) )
			style = "background-color:lightpink;display:table;"

			else if( dir == dir1 ){

				if( !diff_size.includes( local_path ) && diff_path_2.includes( local_path ) )
				style = "opacity: 0.5;"
				else
				style = ""
			}

			else if( dir == dir2 ){

				if( !diff_size.includes( local_path ) &&diff_path_1.includes( local_path ) )
				style = "opacity: 0.5;"
				else
				style = ""
			}

			obj.str += `<li onclick="myFunction(this)" title="${dir.slice(0,-8)}\\${table.join("\\")}" ><span style='${style}'>${y} : ${x[y]}</span></li>`

		}else{

			if( Object.entries(x[y]).length === 0 ){

				if ( !fs.existsSync( `${dir.slice(0,-8)}\\${table.join("\\")}\\${y}` ) )
				style2 = "opacity: 0.5;"
				else
				style2 = ""

				obj.str += `<li id="parent"><button style='${style2}' onclick="foo(this)">${y}</button>
				<ul>
				<li><i>dossier vide</i></li>
				</ul>
				</li>`

			}else{

				if ( !fs.existsSync( `${dir.slice(0,-8)}\\${table.join("\\")}\\${y}` ) )
				style2 = "opacity: 0.5;"
				else
				style2 = ""

			    obj.str += `<li id="parent"><button style='${style2}' onclick="foo(this)">${y}</button><ul>`

			    table.push(y)

			    rec(x[y],dir,obj,i,table)

			    table.pop()

			    obj.str += `</ul></li>`

		  	}

		}

	}

	return obj.str

}

dir1 = "C:\\Users\\USERNAME\\Dropbox"
dir2 = "C:\\Users\\USERNAME\\Desktop\\Dropbox"

obj1 = walk_csv(dir1)
obj2 = walk_csv(dir2)

for ( x of obj1 ) x.pathx = x.pathx.replace("C:\\Users\\USERNAME\\","")
for ( x of obj2 ) x.pathx = x.pathx.replace("C:\\Users\\USERNAME\\Desktop\\","")

	// test
	
	/*duplicate_a = _.difference(obj1,obj2)
	duplicate_b = _.difference(obj2,obj1)

	console.log(obj1.length)
	console.log(duplicate_b.length)*/

	// detect same path with different size

		diff_size = []

		customizer = (a,b) => Array.isArray(a) && a.concat(b)

		dd = _.mergeWith( _.groupBy(obj1,"pathx"), _.groupBy(obj2,"pathx"), customizer )

		for( i in dd ) {

			try { if( dd[i][0].size != dd[i][1].size ) diff_size.push( dd[i][0].pathx ) }catch(e){}
		}

	// remove same path

	obj1 = obj1.map( x => x = JSON.stringify(x) )
	obj2 = obj2.map( x => x = JSON.stringify(x) )

	duplicate_a = _.difference(obj1,obj2)
	duplicate_b = _.difference(obj2,obj1)

	obj1 = duplicate_a.map( x => x = JSON.parse(x) )
	obj2 = duplicate_b.map( x => x = JSON.parse(x) )

	// retire le dossier "heimdall" de l'arborescence

	obj1 = obj1.filter( x => !(/heimdall/).test(x.pathx) )
	obj2 = obj2.filter( x => !(/heimdall/).test(x.pathx) )

	// align item by adding miror item in grey in bothside

	diff_path_1 = obj1.map( x => x.pathx )
	diff_path_2 = obj2.map( x => x.pathx )

	// add to each obj the pathx item they dont have ( pathx in grey later )

		duplicate_a = _.differenceBy(obj1,obj2,"pathx")
		duplicate_b = _.differenceBy(obj2,obj1,"pathx")

		// sort item because mirior item need to match

		oo1 = obj1.concat(duplicate_b).sort( (a,b) => a.pathx.localeCompare(b.pathx) )
		oo2 = obj2.concat(duplicate_a).sort( (a,b) => a.pathx.localeCompare(b.pathx) )

	//

	obj1a = rec ( csvToJson( oo1 ) , dir1 ) 
	obj2a = rec ( csvToJson( oo2 ) , dir2 )

// render html

content = `<style>

ul,li{
	
	list-style-type: circle;
	white-space: nowrap;
}

ul {

	margin-top: 0;
}

li#parent{
	
	list-style-type: square;
}

.hide{

	display: none;
}

button{
	
	cursor:pointer;
	border: none;
	background: none;
	background: lightgreen;
	margin: 5px;
	white-space: pre;
}

</style>

<div style="display:flex;">
	
	<div style="white-space:pre;">${ obj1a }</div> <!--white-space:pre;-->
	<div style="white-space:pre;">${ obj2a }</div> <!--white-space:pre;-->

</div>

<div style="display:flex;">

</div>

<input id="myInput" style=""></input>
<script>

function foo(e){

	e.parentElement.children[1].classList.toggle("hide")
}

/*function myFunction(e) {

	document.querySelector("#myInput").value = e.title

	var copyText = document.querySelector("#myInput")
	copyText.select();

	document.execCommand("copy");
	console.log(copyText.value)

}*/

</script>`

server(content,"html")

function server(x,n) {

	const http = require("http")
	const PORT = 8080

	http.createServer(function (req, res) {
		
		res.writeHead(200,{'content-type':'text/'+n+';charset=utf8'})

		res.end(x)
	  
	}).listen(PORT)

	console.log(`Running at port ${PORT}`)

}
