// Sample Base64 images (minimal size to prevent token bloating but fully functional valid base64 image strings)
// 1x1 transparent PNGs/JPEG-like structures of varying characters that render fine and can be sent to Gemini.
export const SAMPLE_BASE64_BLUE_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwAEhAH7M9uYmgAAAABJRU5ErkJggg=="; // blue pixel
export const SAMPLE_BASE64_RED_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="; // red pixel
export const SAMPLE_BASE64_GREEN_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="; // green pixel
export const SAMPLE_BASE64_BLACK_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; // black pixel

export interface TestProofBundle {
  name: string;
  description: string;
  imageDisplayUrl: string; // Beautiful rich image from Unsplash for visual representation
  base64Data: string;      // The actual base64 data injected for Gemini multimodal analysis
  textProof: string;
  locationMetadata: string;
  statusType: 'compliant' | 'blurry' | 'unrelated';
}

export const TEST_PROOF_BUNDLES: TestProofBundle[] = [
  {
    name: "Mumbai Billboard - Compliant",
    description: "Perfect high-resolution photo showing the T2 Departures digital gate with the GigBoss visual active.",
    imageDisplayUrl: "https://images.unsplash.com/photo-1540339832862-4745198054c4?auto=format&fit=crop&w=600&q=80", // Billboard/city display
    base64Data: SAMPLE_BASE64_GREEN_PIXEL,
    textProof: "[AUTO-PILOT FIELD AGENT WORK]: Arrived at Terminal 2 departures gate. The 3D GigBoss billboard is perfectly functional, fully illuminated, and cycling the 'Rethinking Work Automation' smart-blockchain graphic. Traffic is moderate, morning light. Photo captured from 15m away.",
    locationMetadata: "19.0896° N, 72.8656° E (Mumbai Airport T2 Departures)",
    statusType: "compliant"
  },
  {
    name: "Berlin Snack Shelf - Compliant",
    description: "Detailed closeup of shelves with row alignment and clearly legible price tags.",
    imageDisplayUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80", // Grocery shelves
    base64Data: SAMPLE_BASE64_BLUE_PIXEL,
    textProof: "[AUTO-PILOT FIELD AGENT WORK]: Audited Späti snacks at Rosenthaler Platz. Counted exactly 18 packages of Spicy Peanuts, vertically stacked in 3 visible rows as requested. Brand pricing is $2.49. Clerk's distributor contact confirmed as BerlinGastro GmbH.",
    locationMetadata: "52.5298° N, 13.4019° E (Mitte, Berlin)",
    statusType: "compliant"
  },
  {
    name: "Delhi Ghat Water - Compliant",
    description: "Calm water line intersecting the third concrete tier of the Ghat concrete stairs.",
    imageDisplayUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80", // Calm river ghat stairs
    base64Data: SAMPLE_BASE64_GREEN_PIXEL,
    textProof: "[AUTO-PILOT FIELD AGENT WORK]: Documented Nigambodh Ghat stairs. Water level currently submerge the 3rd tier of concrete steps. Environment is extremely sunny and hot. Water clarity is low/muddy. Landmark temple banner visible nearby.",
    locationMetadata: "28.6631° N, 77.2510° E (Nigambodh Ghat, Delhi)",
    statusType: "compliant"
  },
  {
    name: "Blurry Photo - Needs Revisions",
    description: "worker's hand shook and photo is completely blurred out and hard to read.",
    imageDisplayUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80", // Abstract blurred
    base64Data: SAMPLE_BASE64_RED_PIXEL,
    textProof: "[AUTO-PILOT FIELD AGENT WORK]: I took the photo very quickly while running from airport security. It is slightly blurred and shaky. Checked the billboard at Terminal 2, looks alright.",
    locationMetadata: "19.0888° N, 72.8644° E (Mumbai T2)",
    statusType: "blurry"
  },
  {
    name: "Unrelated Cute Dog - Reject",
    description: "Fraudulent submission. Worker uploaded a cute sleeping golden retriever instead of the field photo.",
    imageDisplayUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80", // Cute dog
    base64Data: SAMPLE_BASE64_BLACK_PIXEL,
    textProof: "[AUTO-PILOT FIELD AGENT WORK]: Everything looks completely fine. Here is the picture of the local surroundings as proof. Money please!",
    locationMetadata: "40.7128° N, 74.0060° W (New York City)",
    statusType: "unrelated"
  }
];
