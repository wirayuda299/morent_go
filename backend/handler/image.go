package handler

import (
	"backend/helper"
	"backend/middleware"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"sync"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type UploadResponse struct {
	PublicId string `json:"public_id"`
	Url      string `json:"url"`
}

func UploadImage(w http.ResponseWriter, r *http.Request) {
	authData, ok := r.Context().Value("clerkAuth").(*middleware.AuthData)
	if !ok || authData.Claims == nil {
		log.Println("User is not authenticated")
		helper.WriteErrorResponse(w, "You must be signed in to access this page", http.StatusUnauthorized)
		return
	}
	err := r.ParseMultipartForm(10 << 20)

	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	files := r.MultipartForm.File["files"]

	cld, _ := cloudinary.NewFromParams(os.Getenv("CLOUDINARY_CLOUD_NAME"), os.Getenv("CLOUDINARY_KEY"), os.Getenv("CLOUDINARY_SECRET_KEY"))

	var uploadedRes []UploadResponse
	var wg sync.WaitGroup
	var mu sync.Mutex

	for _, file := range files {
		wg.Add(1)

		go func(file *multipart.FileHeader) {
			defer wg.Done()

			openedFile, err := file.Open()
			if err != nil {
				mu.Lock()

				helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
				mu.Unlock()
				return
			}
			defer openedFile.Close()

			uploadResult, uploadErr := cld.Upload.Upload(r.Context(), openedFile, uploader.UploadParams{
				Folder:         "morent",
				Transformation: "c_fill,h_300,w_300",
				Format:         "jpeg",
			})
			if uploadErr != nil {
				mu.Lock()
				helper.WriteErrorResponse(w, uploadErr.Error(), http.StatusInternalServerError)
				mu.Unlock()
				return
			}

			mu.Lock()
			uploadedRes = append(uploadedRes, UploadResponse{
				PublicId: uploadResult.AssetID,
				Url:      uploadResult.SecureURL,
			})
			mu.Unlock()
		}(file)
	}

	wg.Wait()

	helper.EncodeResponse(w, "All images have been uploaded", uploadedRes)
}
