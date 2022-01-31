const api_url = "https://test-hosting-version.herokuapp.com/";

const navLinks = document.querySelectorAll("nav a");
const pageTitle = document.getElementById("page-title");
const sections = {
	"view": document.getElementById("show-vals"),
	"add": document.getElementById("add-vals")
};

const tableView = document.getElementById("tableView");
const insertForm = document.getElementById("insert-form");

let updateIndex = -1;

const debuggerDiv = document.getElementById("debug");


insertForm.addEventListener('submit',(event) => {
	event.preventDefault();
	insertValue();
});

document.addEventListener('keydown', (event) => {
	if(event.key == 'Escape') {
		cancelEdit();
	} 
})

function getTableHeaderHTML() {
	return `
		<tr>
			<th>ID</th>
			<th>NAME</th>
			<th>AGE</th>
			<th>CITY</th>
			<th>EDIT</th>
			<th>DELETE</th>
		</tr>
	`;
}

function getTableRowHTML(rowArr) {
	return `
		<tr data-uid=${rowArr[0]}>
			<td>${rowArr[0]}</td>
			<td>${rowArr[1]}</td>
			<td>${rowArr[2]}</td>
			<td>${rowArr[3]}</td>
			<td><button class="edit" onclick="editRow(this)">Edit</button></td>
			<td><button class="del" onclick="deleteValue(this)">Delete</button></td>
		</tr>
	`;
}


function viewSection(sectionName) {
	let title = "";
	let sectionOther = "";

	navLinks.forEach(el => {
		el.classList.remove("current");
	});

	if (sectionName === "view") {
		sectionOther = "add";
		title = "View Table";
		navLinks[0].classList.add("current");
	} else if(sectionName === "add") {
		sectionOther = "view";
		title = "Add Values";
		navLinks[1].classList.add("current");
	} else return;

	sections[sectionName].style.display = "grid";
	sections[sectionOther].style.display = "none";
	pageTitle.textContent = title;
}

function editRow(btn) {
	cancelEdit();
	let trNode = btn.parentNode.parentNode;
	updateIndex = trNode.getAttribute('data-uid');
	for (let i = 1; i < 4; i++) {
		let val = trNode.children[i].innerHTML;
		trNode.children[i].innerHTML = `<input type="text" value='${val}'>`;
		trNode.children[i].setAttribute('data-prev-val', `${val}`)
	}

	btn.textContent = "Save";
	btn.onclick = () => updateValue();
}

function cancelEdit() {
	for (const child of tableView.querySelectorAll('tr')) {
		if(child.getAttribute("data-uid") === updateIndex) {
			for (let i = 1; i < 4; i++) {
				let val = child.children[i].getAttribute('data-prev-val');
				child.children[i].innerHTML = `${val}`;
			}
			let btn = child.querySelector('button');
			btn.textContent = "Edit";
			btn.onclick = () => editRow(btn);
			break;
		}
	}
	updateIndex = -1;
}

function fetchPostMethod(url = api_url, data = {}, callFunction = (res) => {}) {
	console.log(JSON.stringify(data))
	console.log(data)
	fetch(url, {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(data)
		}
	)
		.then(res => res.json())
		.then((res) => {
			if (res["error"]) {
				alert(res["error"]);
				return;
			}
			callFunction(res)
		});
}

function fetchGetMethod(url = api_url, data = {}, callFunction = () => {}) {
	fetch(url, {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
		}
	)
		.then(res => res.json())
		.then((res) => callFunction(res));
}

function showTable() {
	viewSection("view");
	tableHTML = '';
	fetchGetMethod(`${api_url}/get_all_rows`, {},
		(res) => {
			for (const row of res['tableRows']) {
				tableHTML += getTableRowHTML(row)
			}
			tableView.innerHTML = getTableHeaderHTML() + tableHTML;
		}
	);
}

function insertValue() {
	let sendObj = {
		name: insertForm.name.value,
		age: insertForm.age.value,
		city: insertForm.city.value
	};

	fetchPostMethod(`${api_url}/insert`, sendObj,
		(res) => {
			if (res['isInserted'] === true) {
				alert('Row inserted into the table')
				showTable();
			} else {
				alert('Couldn\'t insert the row into the table')
			}
		}
	);
}

function updateValue() {
	if (updateIndex === -1) return;

	let updateInputsList = [];
	for (const child of tableView.querySelectorAll('tr')) {
		if(child.getAttribute("data-uid") === updateIndex) {
			updateInputsList = child.querySelectorAll('input');
			break;
		}
	}

	if(updateInputsList.length != 3) return;

	let sendObj = {
		uid: updateIndex,
		name: updateInputsList[0].value,
		age: updateInputsList[1].value,
		city: updateInputsList[2].value
	};

	fetchPostMethod(`${api_url}/insert`, sendObj,
		(res) => {
			if (res['isUpdated'] === true) {
				alert('Row updated in the table')
				showTable();
			} else {
				alert('Couldn\'t update the row in the table')
			}
		}
	);
}

function deleteValue(btn) {
	let sendObj = {
		uid: btn.parentNode.parentNode.getAttribute("data-uid")
	};

	fetchPostMethod(`${api_url}/delete_row`, sendObj,
		(res) => {
			if (res['isDeleted'] === true) {
				alert('Row deleted from the table')
				showTable();
			} else {
				alert('Couldn\'t delete a row from the table')
			}
		}
	);
}


showTable();
