install bare-kit:
    sudo apt install gh
    gh release download --repo holepunchto/bare-kit --pattern "*.zip"
    unzip prebuilds.zip
    mkdir -p app/libs/
    mv android/bare-kit app/libs/