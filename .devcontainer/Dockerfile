ARG VARIANT=14
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:${VARIANT}

# Import the Microsoft public repository GPG keys
RUN curl -sL https://packages.microsoft.com/keys/microsoft.asc | apt-key add -

# Register the Microsoft Product feed
RUN echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-debian-stretch-prod stretch main" > /etc/apt/sources.list.d/microsoft.list

# Add contrib and non-free repos to sources
RUN sed 's/stretch main/stretch main contrib non-free/g' -i /etc/apt/sources.list

# Install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
	&& apt-get -y install \
	apt-transport-https \
	build-essential \
	curl \
	fonts-firacode \
	gnupg \
	htop \
	nano \
	neofetch \
	powershell \
	tree \ 
	vim \
	wget \
	zsh

# Download GitHub CLI v0.11.1 and put it in /usr/local/bin
RUN curl -sL https://github.com/cli/cli/releases/download/v0.11.1/gh_0.11.1_linux_amd64.tar.gz | tar -xz --wildcards "*gh" && mv gh*linux_amd64/bin/gh . && rm -r gh_*linux_amd64 \
	&& mv ./gh /usr/local/bin \
	&& chmod +x /usr/local/bin/gh

# Install typescript. eslint is installed by javascript image
ARG USERNAME=node
RUN sudo -u ${USERNAME} npm install -g typescript

# [Optional] Uncomment if you want to install more global node packages
RUN sudo -u node npm install -g \
	all-contributors-cli \
	commitizen \
	eslint \
	git-open \
	http-server \
	jest \
	lint-staged \
	node-gyp \
	pm2 \
	prettier \
	rimraf \
	rollup \
	standard-version \
	ts-node

# Switch to non-root user
USER node

# Setup Oh-my-zsh, plugins, fonts and config

## Download zsh-git-enhanced
RUN git clone https://github.com/favware/zsh-git-enhanced.git /home/node/.oh-my-zsh/custom/plugins/zsh-git-enhanced --depth 1 \ 
	# Download zsh-syntax-highlighting
	&& git clone https://github.com/zsh-users/zsh-syntax-highlighting.git /home/node/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting --depth 1 \
	# Download zsh-autosuggestions
	&& git clone https://github.com/zsh-users/zsh-autosuggestions /home/node/.oh-my-zsh/custom/plugins/zsh-autosuggestions --depth 1 \
	# Download powerlevel10k
	&& git clone https://github.com/romkatv/powerlevel10k.git /home/node/.oh-my-zsh/custom/themes/powerlevel10k --depth=1 \
	# Download powerlevel10k config
	&& curl -sLo /home/node/.p10k.zsh https://raw.githubusercontent.com/Favna/dotfiles/main/.p10k.zsh \
	# Download .profile
	&& curl -sLo /home/node/.profile https://raw.githubusercontent.com/Favna/dotfiles/main/.profile \
	# Download .zshrc
	&& curl -sLo /home/node/.zshrc https://raw.githubusercontent.com/Favna/dotfiles/main/.zshrc \
	# Create fonts directory
	&& mkdir /home/node/.fonts \
	# Download MesloLGS font files
	&& curl -sLo /home/node/.fonts/MesloLGS\ NF\ Regular.ttf https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Regular.ttf \
	&& curl -sLo /home/node/.fonts/MesloLGS\ NF\ Bold.ttf https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Bold.ttf \
	&& curl -sLo /home/node/.fonts/MesloLGS\ NF\ Italic.ttf https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Italic.ttf \
	&& curl -sLo /home/node/.fonts/MesloLGS\ NF\ Bold\ Italic.ttf https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Bold%20Italic.ttf \
	# Modify syntax line highlighter path
	&& curl -sL https://raw.githubusercontent.com/Favna/dotfiles/main/line-highlighters-addition.zsh >> /home/node/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting/highlighters/line/line-highlighter.zsh