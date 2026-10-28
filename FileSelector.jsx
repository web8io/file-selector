import { useRef, useState, useEffect } from "react";

const FileSelector = ({open, files, loading, onUpload, allowedMimeTypes = [], selectType, onFilter, onSearch, onDelete, onClose, onSelect,}) => {
	const [search, setSearch] = useState("");
	const [type, setType] = useState("all");
	const [selected, setSelected] = useState(null);
	const inputRef = useRef(null);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadFilename, setUploadFilename] = useState("");
	const [error, setError] = useState(false);


	useEffect(() => {
		if (!open) {
			return;
		}

		setSelected(null);
		setSearch("");
		const filterType = selectType || "all";
		setType(filterType);

	}, [open, selectType]);

	const handleTypeChange = (value) => {
		setSelected(null);
		setType(value);
		onFilter(search, value);
	};

	const handleSearchChange = (value) => {
		setSearch(value);
		onSearch(value, type);
	};

	const uploadFiles = async (uploadedFiles, input = null) => {
		if (!uploadedFiles.length) {
			return;
		}

		setError("");
		setUploading(true);
		setUploadProgress(0);

		const assets = [];

		try {
			for (const file of uploadedFiles) {
				if (!allowedMimeTypes.includes(file.type)) {
					assets.push({
						asset: null,
						error: `${file.name}: Unsupported file type`,
					});

					continue;
				}

				setUploadFilename(file.name);
				setUploadProgress(0);

				try {
					const result = await onUpload(file, (progress) => {
						setUploadProgress(progress);
					});

					assets.push(result);

					if (result?.asset && (!selectType || selectType === "all" || result.asset.type === selectType)) {
						setSelected(result.asset);
					}
				} catch {
					assets.push({
						asset: null,
						error: `${file.name}: Upload failed`,
					});
				}
			}

			const errors = assets
				.map((result) => result?.error)
				.filter(Boolean);

			if (errors.length) {
				setError(errors.join("\n"));
			}
		} finally {
			setUploading(false);
			setUploadProgress(0);
			setUploadFilename("");

			if (input) {
				input.value = "";
			}
		}
	};

	const handleUpload = (event) => {
		const uploadedFiles = Array.from(event.target.files || []);

		uploadFiles(uploadedFiles, event.target);
	};

	const handleDrop = (event) => {
		event.preventDefault();

		const droppedFiles = Array.from(event.dataTransfer.files || []);

		uploadFiles(droppedFiles);
	};

	const handleSelect = () => {
		if (!selected) {
			return;
		}

		onSelect(selected);
		onClose();
	};

	const handleDelete = async (file) => {
		try {
			await onDelete(file);

			if (selected?.id === file.id) {
				setSelected(null);
			}
		} catch (error) {
			setError(error?.message || "Failed to delete file");
		}
	};

	const formatFileSize = (size) => {
		if (size < 1024) {
			return `${size} B`;
		}

		if (size < 1024 * 1024) {
			return `${(size / 1024).toFixed(1)} KB`;
		}

		if (size < 1024 * 1024 * 1024) {
			return `${(size / (1024 * 1024)).toFixed(1)} MB`;
		}

		return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
	};

	const getFilePreview = (file) => {
		if (file.type === "IMAGE") {
			return (
				<img
					src={file.url}
					alt={file.name}
					title={file.filename}
					className="w-full h-full object-contain"
				/>
			);
		}

		if (file.type === "VIDEO") {
			return (
				<>
					<video
						src={file.url}
						className="w-full h-full object-contain"
						muted
					/>

					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center">
							<svg
								className="w-4 h-4 text-white ml-0.5"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M8 5v14l11-7z" />
							</svg>
						</div>
					</div>
				</>
			);
		}

		if (file.type === "PDF") {
			return (
				<div className="flex flex-col items-center justify-center h-full">
					<svg
						className="w-10 h-10 text-red-400"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
					>
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
						<path d="M14 2v6h6" />
						<path d="M8 13h8M8 17h5" />
					</svg>

					<span className="mt-2 text-[11px] text-zinc-400">
						PDF
					</span>
				</div>
			);
		}

		if (file.type === "AUDIO") {
			return (
				<div className="flex items-center justify-center h-full">
					<svg
						className="w-10 h-10 text-zinc-400"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
					>
						<path d="M9 18V5l12-2v13" />
						<circle cx="6" cy="18" r="3" />
						<circle cx="18" cy="16" r="3" />
					</svg>
				</div>
			);
		}

		return (
			<div className="flex items-center justify-center h-full">
				<svg
					className="w-10 h-10 text-zinc-500"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
				>
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
					<path d="M14 2v6h6" />
				</svg>
			</div>
		);
	};

	if (!open) {
		return null;
	}

	return (
		<div id="fileSelector" className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-6">
			<div className="flex flex-col w-full max-w-5xl h-[85vh] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">

				{/* Header */}
				<div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
					<div>
						<h2 className="text-sm font-medium text-white">
							Select a file
						</h2>

						<p className="mt-1 text-xs text-zinc-500">
							Choose an existing file or upload a new one
						</p>
					</div>

					{/* Toolbar */}
					<div className="flex items-center gap-3">
						<div className="relative flex-1">
							<svg
								className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<circle cx="11" cy="11" r="7" />
								<path d="m20 20-3.5-3.5" />
							</svg>

							<input
								type="text"
								id="searchFiles"
								value={search}
								onChange={(event) => handleSearchChange(event.target.value)}
								placeholder="Search files..."
								className="w-full h-9 pl-9 pr-9 rounded-md border border-zinc-800 bg-zinc-900 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-zinc-600"
							/>

							{search && (
								<button
									type="button"
									onClick={() => handleSearchChange("")}
									className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 text-zinc-500 hover:text-zinc-300"
									aria-label="Clear search"
								>
									<svg
										className="w-4 h-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path d="M6 6l12 12" />
										<path d="M18 6 6 18" />
									</svg>
								</button>
							)}
						</div>

						<select
							id="selectType"
							value={type}
							onChange={(event) => handleTypeChange(event.target.value)}
							className="h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900 text-sm text-zinc-300 outline-none"
						>
							<option value="all">All files</option>
							<option value="IMAGE">Images</option>
							<option value="VIDEO">Videos</option>
							<option value="AUDIO">Audio</option>
							<option value="PDF">PDF</option>
							<option value="DOCUMENT">Documents</option>
						</select>

						<input
							ref={inputRef}
							type="file"
							multiple
							accept={allowedMimeTypes.join(",")}
							className="hidden"
							onChange={handleUpload}
						/>

						<button
							type="button"
							disabled={uploading}
							onClick={() => inputRef.current?.click()}
							className="flex items-center gap-2 h-9 px-3 rounded-md bg-white text-sm font-medium text-zinc-900 hover:bg-zinc-200 cursor-pointer"
						>
							<svg
								className="w-4 h-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
							>
								<path d="M12 16V4" />
								<path d="m7 9 5-5 5 5" />
								<path d="M4 20h16" />
							</svg>

							Upload files
						</button>
					</div>
				</div>

				

				{ /* Uplaod error */}
				{error && (
					<div className="mx-5 mt-3 flex items-center justify-between gap-3 rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-400">
						<span className="whitespace-pre-wrap">{error}</span>

						<button
							type="button"
							onClick={() => setError("")}
							className="shrink-0 text-red-400 hover:text-red-300"
						>
							<svg
								className="w-4 h-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				)}

				{/* upload progress */}
				{uploading && (
					<div className="mx-5 mt-3 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-3">
						<div className="flex items-center justify-between gap-3">
							<span className="truncate text-xs text-zinc-300">
								Uploading {uploadFilename}
							</span>

							<span className="shrink-0 text-xs text-zinc-500">
								{uploadProgress}%
							</span>
						</div>

						<div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800">
							<div
								className="h-full rounded-full bg-white transition-all duration-150"
								style={{
									width: `${uploadProgress}%`,
								}}
							/>
						</div>
					</div>
				)}

				{/* Files */}
				<div className="flex-1 overflow-y-auto p-5">
					{loading ? (
						<div className="flex flex-col items-center justify-center min-h-[300px]">
							<svg
								className="w-6 h-6 animate-spin text-zinc-500"
								viewBox="0 0 24 24"
								fill="none"
							>
								<circle
									cx="12"
									cy="12"
									r="9"
									stroke="currentColor"
									strokeWidth="2"
									className="opacity-25"
								/>

								<path
									d="M21 12a9 9 0 0 0-9-9"
									stroke="currentColor"
									strokeWidth="2"
								/>
							</svg>

							<p className="mt-3 text-sm text-zinc-500">
								Loading files...
							</p>
						</div>
					) : files.length === 0 ? (
							<div 
								onDragOver={(event) => {
									event.preventDefault();
								}}
								onDrop={handleDrop}
								className="flex flex-col items-center justify-center min-h-[300px] text-center"
							>
								<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800">
									<svg
										className="w-6 h-6 text-zinc-600"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
									>
										<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
										<path d="M14 2v6h6" />
									</svg>
								</div>

								<p className="mt-3 text-sm text-zinc-400">
									No files found
								</p>

								<p className="mt-1 text-xs text-zinc-600">
									Upload a file or try another search
								</p>
							</div>
						) : (
							<div
								onDragOver={(event) => {
									event.preventDefault();
								}}
								onDrop={handleDrop}
								className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-[300px]"
							>
								{files.map((file) => {
									const isSelected = selected?.id === file.id;
									const canSelect = !selectType || selectType === "all" || file.type === selectType;
									return (
										<div
											key={file.id}
											role="button"
											tabIndex={canSelect ? 0 : -1}
											onKeyDown={(event) => {
												if (!canSelect || (event.key !== "Enter" && event.key !== " ")) {
													return;
												}

												event.preventDefault();
												setSelected((prev) => prev?.id === file.id ? null : file);
											}}
											onClick={() => {
													if (canSelect) setSelected((prev) => prev?.id === file.id ? null : file);
												}
											}
											className={`text-left group ${canSelect ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
										>
											<div
												className={`
													relative aspect-square overflow-hidden rounded-lg
													border bg-zinc-900 transition
													flex items-center justify-center
													${
														isSelected
															? "border-white ring-1 ring-white"
															: "border-zinc-800 hover:border-zinc-600"
													}
												`}
											>
												{getFilePreview(file)}

												{isSelected && (
													<div className="absolute top-2 left-2 flex items-center justify-center w-5 h-5 rounded-full bg-white text-zinc-900">
														<svg
															className="w-3.5 h-3.5"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																d="m5 12 4 4L19 6"
															/>
														</svg>
													</div>
												)}

												<button
													type="button"
													disabled={uploading}
													onClick={(event) => {
														event.stopPropagation();
														handleDelete(file);
													}}
														className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-md bg-black/70 text-zinc-300 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
												>
													<svg
														className="w-4 h-4"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="1.5"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M6 7h12M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v6M14 11v6"
														/>
													</svg>
												</button>
											</div>

											<div className="mt-2">
												<p className="truncate text-xs text-zinc-300" title={file.name}>
													{file.name}
												</p>

												{file.size && (
													<p className="mt-0.5 text-[11px] text-zinc-600">
														{formatFileSize(file.size)}
														{file.width && file.height && (
															<> · {file.width} × {file.height}</>
														)}
													</p>
												)}
											</div>
										</div>
									);
								})}
							</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800">
					<span className="text-xs text-zinc-600">
						{files.length} files
					</span>

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={onClose}
							className="h-8 px-3 rounded-md text-xs text-zinc-400 cursor-pointer hover:text-white hover:bg-zinc-800"
						>
							Cancel
						</button>

						<button
							type="button"
							disabled={!selected}
							onClick={handleSelect}
							className="h-8 px-4 rounded-md bg-white text-xs font-medium text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-200"
						>
							Select
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FileSelector;