# @web8io/file-selector

A reusable React file selector modal for browsing, uploading, searching, filtering, and selecting files.

## Installation

```bash
npm install @web8io/file-selector
```

## Usage

```jsx
import { useState } from "react";
import FileSelector from "@web8io/file-selector";
import "@web8io/file-selector/file-selector.css";

function Example() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button type="button" onClick={() => setOpen(true)}>
				Choose file
			</button>

			<FileSelector
				open={open}
				files={[]}
				loading={false}
				allowedMimeTypes={["image/jpeg", "image/png"]}
				onUpload={async (file, onProgress) => {
					// Upload the file and return the result expected by FileSelector.
					// For example: { asset: uploadedAsset }
					throw new Error("Connect your upload handler");
				}}
				onDelete={async (file) => {
					// Delete the file using your own API.
				}}
				onSearch={(search, type) => {
					// Fetch or filter files using the search term and type.
				}}
				onFilter={(search, type) => {
					// Fetch or filter files using the search term and type.
				}}
				onSelect={(file) => {
					console.log("Selected file:", file);
				}}
				onClose={() => setOpen(false)}
			/>
		</>
	);
}

export default Example;
```

The example shows where to connect your own file API. Replace the upload and delete handlers with your implementation, and pass your file list through the `files` prop.

## Props

| Prop | Description |
| --- | --- |
| `open` | Controls whether the modal is visible. |
| `files` | Array of files to display. |
| `loading` | Indicates whether the file list is loading. |
| `allowedMimeTypes` | MIME types accepted for upload. |
| `selectType` | Optional type restriction for file selection, such as `IMAGE` or `VIDEO`. |
| `onUpload` | Callback to upload a file. Receives the file and a progress callback. |
| `onDelete` | Callback to delete a file. |
| `onSearch` | Called when the search term changes. |
| `onFilter` | Called when the file type filter changes. |
| `onSelect` | Called with the selected file after the user confirms selection. |
| `onClose` | Called when the modal is closed. |

## File object

Each file object should include the fields used by the component, such as:

- `id`
- `name`
- `url`
- `type` (for example, `IMAGE`, `VIDEO`, `AUDIO`, `PDF`, or `DOCUMENT`)
- `size` (optional)
- `width` and `height` (optional, for images)

The `onUpload` callback should return an object containing the uploaded asset, such as `{ asset: uploadedAsset }`. The component uses the returned asset's `id`, `type`, and other file fields.

## Styling

Import the stylesheet in your application:

```jsx
import "@web8io/file-selector/file-selector.css";
```

## Requirements

- React 18 or later
- A build setup that supports JSX in dependencies

## License

MIT
