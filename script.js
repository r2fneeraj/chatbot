let isOpen = false;

let session = {
  service: "",
  requirement: "",
  name: "",
  phone: "",
  step: "start"
};

const chatBody = document.getElementById("chat-body");
const input = document.getElementById("userInput");

/* helpers */
function toggleChat(){
  isOpen = !isOpen;
  document.getElementById("chatbot").style.display = isOpen ? "flex" : "none";
  if(isOpen && chatBody.innerHTML.trim()==="") startChat();
}

function scrollToBottom(){
  chatBody.scrollTop = chatBody.scrollHeight;
}

function addBot(msg){
  const div = document.createElement("div");
  div.className="bot";
  div.innerHTML = msg;
  chatBody.appendChild(div);
  scrollToBottom();
  return div;
}

function addUser(msg){
  const div = document.createElement("div");
  div.className="user";
  div.innerHTML = msg;
  chatBody.appendChild(div);
  scrollToBottom();
}

function addButtonsUnder(container, buttons){
  const wrap = document.createElement("div");
  wrap.className = "options-wrap";

  buttons.forEach((btn)=>{
    const b = document.createElement("button");
    b.className = "option-btn";
    b.innerHTML = btn.label;
    b.onclick = ()=> btn.onClick(btn.value);
    wrap.appendChild(b);
  });

  container.appendChild(wrap);
  scrollToBottom();
}

/* utilities */
function normalizeText(t){ return (t||"").trim().toLowerCase(); }

function isValidPhone(phone){
  const p = phone.replace(/\s+/g,"");
  return /^(\+91)?[6-9]\d{9}$/.test(p);
}

function showSupportOptions(){
  const m = addBot("📞 Need support? Choose an option 👇");
  addButtonsUnder(m, [
    { label:"📞 Call Support", value:"call", onClick:()=>addBot("Call: <b>+91XXXXXXXXXX</b>") },
    { label:"💬 WhatsApp Support", value:"wa", onClick:()=>addBot("WhatsApp: <b>+91XXXXXXXXXX</b>") }
  ]);
}

/* content */
const servicesInfo = {
  "Web Development": {
    info: `<b>Web Development ✅</b><br>We build modern websites (business / ecommerce / landing pages / admin panels).<br><br>Do you want options?`,
    options: ["Business Website", "Ecommerce Website", "Landing Page", "Portfolio Website"]
  },
  "App Development": {
    info: `<b>App Development ✅</b><br>We create Android/iOS apps with login, admin panel, payment & API integration.<br><br>Do you want options?`,
    options: ["Android App", "iOS App", "Android + iOS", "Admin Panel App"]
  },
  "UI/UX Design": {
    info: `<b>UI/UX Design ✅</b><br>We design clean UI/UX in Figma for websites, dashboards, and mobile apps.<br><br>Do you want options?`,
    options: ["Website UI", "Mobile App UI", "Dashboard UI", "Redesign Existing UI"]
  },
  "SEO / Digital Marketing": {
    info: `<b>SEO / Digital Marketing ✅</b><br>We increase traffic & leads using SEO, Google Ads, and social media marketing.<br><br>Do you want options?`,
    options: ["SEO", "Google Ads", "Social Media Marketing", "Local SEO"]
  },
  "Maintenance & Support": {
    info: `<b>Maintenance & Support ✅</b><br>Bug fixing, updates, speed optimization, hosting support, backups.<br><br>Do you want options?`,
    options: ["Bug Fixing", "Website Updates", "Performance Boost", "Hosting Support"]
  }
};

const serviceList = Object.keys(servicesInfo);

/* start */
function startChat(){
  addBot("Hey 👋 Welcome to <b>Corbtech</b>!");
  const greet = addBot("I can help you with our software services 😊<br><br>Please choose one service 👇");

  addButtonsUnder(greet, [
    { label:"🌐 Web Development", value:"Web Development", onClick:chooseService },
    { label:"📱 App Development", value:"App Development", onClick:chooseService },
    { label:"🎨 UI/UX Design", value:"UI/UX Design", onClick:chooseService },
    { label:"📈 SEO / Digital Marketing", value:"SEO / Digital Marketing", onClick:chooseService },
    { label:"🛠️ Maintenance & Support", value:"Maintenance & Support", onClick:chooseService }
  ]);

  session.step = "service";
}

/* flow */
function chooseService(serviceName){
  addUser(serviceName);
  session.service = serviceName;
  session.step = "service_selected";

  const botMsg = addBot(servicesInfo[serviceName].info);

  addButtonsUnder(botMsg, [
    { label:"✅ Yes, show options", value:"yes", onClick:()=>showServiceOptions(serviceName) },
    { label:"✍️ No, I want to type requirement", value:"no", onClick:goToRequirement }
  ]);
}

function showServiceOptions(serviceName){
  session.step = "option_select";

  const m = addBot("Select an option 👇");
  const opts = servicesInfo[serviceName].options.map(op => ({
    label: op,
    value: op,
    onClick: chooseOption
  }));

  addButtonsUnder(m, opts);
}

function chooseOption(optionText){
  addUser(optionText);
  session.requirement = optionText;
  session.step = "name";
  addBot("Great ✅ Please share your name 👤");
}

function goToRequirement(){
  session.step = "requirement";
  addBot("No worries 🙂 Please type your requirement in short.");
}

/* input handler */
function handleUserInput(){
  const text = input.value.trim();
  if(!text) return;

  addUser(text);
  input.value = "";

  const t = normalizeText(text);

  // global keywords
  if(t.includes("agent") || t.includes("support") || t.includes("call") || t.includes("whatsapp")){
    showSupportOptions();
    return;
  }

  // greeting
  if(["hi","hello","hey"].includes(t)){
    addBot("Hey 👋 Please choose a service from above options 👆");
    return;
  }

  // step rules
  if(session.step === "service"){
    // allow typing service name
    const match = serviceList.find(s => normalizeText(s) === t);
    if(match) chooseService(match);
    else addBot("Please select a service using buttons above 👆");
    return;
  }

  if(session.step === "service_selected" || session.step === "option_select"){
    addBot("Please tap an option above 👆 (✅ show options / ✍️ type requirement).");
    return;
  }

  if(session.step === "requirement"){
    session.requirement = text;
    session.step = "name";
    addBot("Thanks ✅ Your name?");
    return;
  }

  if(session.step === "name"){
    if(text.length < 2){
      addBot("Please enter a valid name 🙂");
      return;
    }
    session.name = text;
    session.step = "phone";
    addBot("Your phone / WhatsApp number? 📱");
    return;
  }

  if(session.step === "phone"){
    if(!isValidPhone(text)){
      addBot("Please enter a valid mobile number (10 digits) 🙂");
      return;
    }
    session.phone = text;
    session.step = "done";

    addBot("✅ Thank you! Our team will contact you shortly.");
    saveLead();
    return;
  }

  addBot("If you need help, type <b>support</b> 🙂");
}

/* Enter key */
input.addEventListener("keydown", function(e){
  if(e.key === "Enter"){
    e.preventDefault();
    handleUserInput();
  }
});

/* save lead */
function saveLead(){
  fetch("/save-lead", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      service: session.service,
      requirement: session.requirement,
      name: session.name,
      phone: session.phone,
      createdAt: new Date().toLocaleString()
    })
  })
  .then(r=>r.json())
  .then(()=>console.log("✅ Lead saved"))
  .catch(err=>console.error("❌ Save error:", err));
}
