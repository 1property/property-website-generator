// Supabase Client Setup
const supabaseUrl = 'https://erabbaphqueanoddsoqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Function to show property post form
function showPostForm() {
  document.getElementById('property-listing').classList.add('hidden');
  document.getElementById('property-form-section').classList.remove('hidden');
  document.getElementById('form-title').textContent = "📤 Post Your Property";
}

// Function to show property listings page
function showListingPage() {
  document.getElementById('property-listing').classList.remove('hidden');
  document.getElementById('property-form-section').classList.add('hidden');
  displayProperties();
}

// Function to reset the property form
function resetForm() {
  document.getElementById('property-form').reset();
  document.getElementById('edit-index').value = '';
}

// Function to display properties
async function displayProperties() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const properties = JSON.parse(localStorage.getItem('properties')) || [];
  const list = document.getElementById('properties-list');
  list.innerHTML = '';

  properties.forEach((p, index) => {
    if (
      p.name.toLowerCase().includes(search) ||
      p.location.toLowerCase().includes(search)
    ) {
      const message = encodeURIComponent(
        `Hi, I'm interested in this property:\n\n` +
        `🏡 Name: ${p.name}\n` +
        `💰 Price: RM ${p.price}\n` +
        `📍 Location: ${p.location}\n` +
        `📏 Size: ${p.size} sqft\n` +
        `🛏️ ${p.bedroom} Bedrooms | 🛁 ${p.bathroom} Bathrooms\n` +
        `📃 Tenure: ${p.tenure}\n` +
        `🏠 Type: ${p.type}`
      );
      const whatsappLink = `https://wa.me/60123386162?text=${message}`;

      list.innerHTML += `
        <div class="property-card">
          <img src="${p.image}" alt="${p.name}" />
          <div class="info">
            <h3>${p.name}</h3>
            <p><strong>Price:</strong> RM ${p.price}</p>
            <p><strong>Location:</strong> ${p.location}</p>
            <p><strong>Type:</strong> ${p.type}</p>
            <p><strong>Size:</strong> ${p.size} sqft</p>
            <p><strong>Tenure:</strong> ${p.tenure}</p>
            <p><strong>House Type:</strong> ${p.houseType}</p>
            <p><strong>Bedrooms:</strong> ${p.bedroom} | <strong>Bathrooms:</strong> ${p.bathroom}</p>
            <p><strong>Land Title:</strong> ${p.landTitle}</p>
            <p><strong>Description:</strong> ${p.description}</p>
            <div class="actions">
              <button class="btn" onclick="editProperty(${index})">Edit</button>
              <button class="btn" style="background:#ef4444" onclick="deleteProperty(${index})">Delete</button>
              <a href="${whatsappLink}" target="_blank" class="btn whatsapp-btn">
                Contact via WhatsApp
              </a>
            </div>
          </div>
        </div>`;
    }
  });
}

// Function to edit a property
function editProperty(index) {
  const properties = JSON.parse(localStorage.getItem('properties')) || [];
  const p = properties[index];

  document.getElementById('edit-index').value = index;
  document.getElementById('property-name').value = p.name;
  document.getElementById('property-price').value = p.price;
  document.getElementById('property-description').value = p.description;
  document.getElementById('property-location').value = p.location;
  document.getElementById('property-type').value = p.type;
  document.getElementById('property-size').value = p.size;
  document.getElementById('property-tenure').value = p.tenure;
  document.getElementById('house-type').value = p.houseType;
  document.getElementById('bedroom').value = p.bedroom;
  document.getElementById('bathroom').value = p.bathroom;
  document.getElementById('land-title').value = p.landTitle;

  showPostForm();
  document.getElementById('form-title').textContent = "✏️ Edit Property";
}

// Function to delete a property
function deleteProperty(index) {
  if (confirm('Are you sure you want to delete this property?')) {
    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    properties.splice(index, 1);
    localStorage.setItem('properties', JSON.stringify(properties));
    displayProperties();
  }
}

// Handle property form submission
document.getElementById('property-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  const index = document.getElementById('edit-index').value;
  const imageInput = document.getElementById('property-image');
  const file = imageInput.files[0];

  const saveData = (imageUrl) => {
    const property = {
      name: document.getElementById('property-name').value,
      price: document.getElementById('property-price').value,
      description: document.getElementById('property-description').value,
      location: document.getElementById('property-location').value,
      type: document.getElementById('property-type').value,
      size: document.getElementById('property-size').value,
      tenure: document.getElementById('property-tenure').value,
      houseType: document.getElementById('house-type').value,
      bedroom: document.getElementById('bedroom').value,
      bathroom: document.getElementById('bathroom').value,
      landTitle: document.getElementById('land-title').value,
      image: imageUrl
    };

    let properties = JSON.parse(localStorage.getItem('properties')) || [];
    if (index) {
      properties[index] = property;
    } else {
      properties.push(property);
    }

    localStorage.setItem('properties', JSON.stringify(properties));
    showListingPage();
  };

  if (file) {
    const fileName = `uploads/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(fileName, file);

    if (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed.');
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName);

    saveData(publicUrlData.publicUrl);
  } else {
    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    const existingImage = index ? properties[index].image : '';
    saveData(existingImage);
  }
});

// Load properties when the page loads
window.onload = displayProperties;
