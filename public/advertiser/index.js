// Initialize Supabase Client
const supabaseUrl = "https://rcfbgkdysropbfrkvure.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZmJna2R5c3JvcGJmcmt2dXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMzEyNjQsImV4cCI6MjA5NjgwNzI2NH0.d7P60IdQQWjuRtFPyjLLihVKDI7zccZn_XbICsMyiAI";

const client = supabase.createClient(supabaseUrl, supabaseKey);

// Pricing Packages Mapping
const packages = {
  starter: {
    name: 'Starter Package',
    price: '$15.00',
    cents: 1500,
    stripeUrl: 'https://buy.stripe.com/test_starter15'
  },
  growth: {
    name: 'Growth Package',
    price: '$60.00',
    cents: 6000,
    stripeUrl: 'https://buy.stripe.com/test_growth60'
  },
  pro: {
    name: 'Scale Package',
    price: '$100.00',
    cents: 10000,
    stripeUrl: 'https://buy.stripe.com/test_scale100'
  }
};

let selectedPackage = 'growth';

// Select pricing plan and update UI
window.selectPackage = function(pkgId) {
  if (!packages[pkgId]) return;
  selectedPackage = pkgId;

  // Toggle active styling on card elements
  document.querySelectorAll('.package-card').forEach(card => {
    card.classList.remove('selected');
  });

  const radioInput = document.getElementById(`pkg-${pkgId}`);
  if (radioInput) {
    radioInput.checked = true;
    const parentCard = radioInput.closest('.package-card');
    if (parentCard) parentCard.classList.add('selected');
  }

  // Update button texts
  document.querySelectorAll('.package-card .btn-select').forEach(btn => {
    btn.textContent = 'Select Plan';
    btn.classList.remove('btn-primary');
  });

  const activeBtn = document.getElementById(`btn-select-${pkgId}`);
  if (activeBtn) {
    activeBtn.textContent = 'Selected';
    activeBtn.classList.add('btn-primary');
  }

  // Update form plan summary
  const summaryVal = document.getElementById('selectedPlanSummary');
  if (summaryVal) {
    const pkg = packages[pkgId];
    summaryVal.textContent = `${pkg.name} (${pkg.price})`;
  }
};

// Mirror form ad text and destination link to the chat preview widget
window.updateAdPreview = function() {
  const adTextInput = document.getElementById('adText');
  const adLinkText = document.getElementById('preview-ad-link');
  const charCounter = document.getElementById('charCount');
  const clickUrlInput = document.getElementById('clickUrl');

  if (adTextInput && adLinkText && charCounter) {
    const text = adTextInput.value.trim() || 'Your sponsored text goes here...';
    adLinkText.textContent = text;
    charCounter.textContent = 50 - adTextInput.value.length;
  }

  if (adLinkText && clickUrlInput) {
    adLinkText.href = clickUrlInput.value.trim() || '#';
  }
};

// Handle Ad Form Submission
document.addEventListener('DOMContentLoaded', () => {
  // Sync the default selection UI state
  selectPackage(selectedPackage);

  // Bind clickUrl input changes to the preview updates
  const clickUrlInput = document.getElementById('clickUrl');
  if (clickUrlInput) {
    clickUrlInput.addEventListener('input', updateAdPreview);
  }

  // Check if we have a saved submission ID in localStorage to prepopulate the status check field
  const savedSubId = localStorage.getItem('gptw_last_submission_id');
  const statusIdInput = document.getElementById('statusIdInput');
  if (savedSubId && statusIdInput) {
    statusIdInput.value = savedSubId;
  }

  const adForm = document.getElementById('adForm');
  if (adForm) {
    adForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      const originalText = submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Campaign...';

      const advertiserName = document.getElementById('advName').value.trim();
      const advertiserEmail = document.getElementById('advEmail').value.trim();
      const adText = document.getElementById('adText').value.trim();
      const clickUrl = document.getElementById('clickUrl').value.trim();
      const pkg = packages[selectedPackage];
      const budgetCents = pkg.cents;

      try {
        const { data, error } = await client
          .from('ad_submissions')
          .insert([
            {
              advertiser_name: advertiserName,
              advertiser_email: advertiserEmail,
              ad_text: adText,
              click_url: clickUrl,
              budget_cents: budgetCents,
              payment_status: 'pending_payment',
              approval_status: 'pending_approval'
            }
          ])
          .select();

        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('No submission data returned.');
        }

        const submission = data[0];
        const submissionId = submission.id;

        // Save for tracking
        localStorage.setItem('gptw_last_submission_id', submissionId);
        
        // Show success and redirect
        submitBtn.textContent = 'Redirecting to Stripe...';
        
        const stripeUrl = `${pkg.stripeUrl}?client_reference_id=${submissionId}`;
        setTimeout(() => {
          window.location.href = stripeUrl;
        }, 1200);

      } catch (err) {
        console.error('Submission failed:', err);
        alert(`Failed to create campaign: ${err.message || err.details || err}`);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
});

// Check Submission status from Supabase
window.checkSubmissionStatus = async function() {
  const statusIdInput = document.getElementById('statusIdInput');
  const statusResult = document.getElementById('statusResult');
  const resName = document.getElementById('resName');
  const resCopy = document.getElementById('resCopy');
  const resPayment = document.getElementById('resPayment');
  const resApproval = document.getElementById('resApproval');

  if (!statusIdInput || !statusResult) return;

  const submissionId = statusIdInput.value.trim();
  if (!submissionId) {
    alert('Please enter a Submission/Campaign ID.');
    return;
  }

  // Basic UUID validator
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(submissionId)) {
    alert('Invalid submission ID format. Please check the ID and try again.');
    return;
  }

  statusResult.style.display = 'none';

  try {
    const { data, error } = await client
      .from('ad_submissions')
      .select('*')
      .eq('id', submissionId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      alert('Campaign not found. Please verify the submission ID.');
      return;
    }

    // Populate lookup UI fields
    resName.textContent = data.advertiser_name;
    resCopy.textContent = data.ad_text;

    // Payment Badge
    const payStatus = data.payment_status;
    resPayment.textContent = payStatus === 'paid' ? 'Paid' : 'Pending Payment';
    resPayment.className = `result-val badge ${payStatus === 'paid' ? 'paid' : 'pending'}`;

    // Approval Badge
    const appStatus = data.approval_status;
    let appText = 'Pending Approval';
    let appClass = 'pending';
    if (appStatus === 'approved') {
      appText = 'Approved';
      appClass = 'approved';
    } else if (appStatus === 'rejected') {
      appText = 'Rejected';
      appClass = 'rejected';
    }
    resApproval.textContent = appText;
    resApproval.className = `result-val badge ${appClass}`;

    statusResult.style.display = 'block';

  } catch (err) {
    console.error('Status fetch failed:', err);
    alert(`Error looking up campaign: ${err.message || err}`);
  }
};
