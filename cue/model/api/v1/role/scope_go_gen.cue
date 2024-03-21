// Code generated by cue get go. DO NOT EDIT.

//cue:generate cue get go github.com/perses/perses/pkg/model/api/v1/role

package role

#Scope: _ // #enumScope

#enumScope:
	#DashboardScope |
	#DatasourceScope |
	#EphemeralDashboardScope |
	#FolderScope |
	#GlobalDatasourceScope |
	#GlobalRoleScope |
	#GlobalRoleBindingScope |
	#GlobalSecretScope |
	#GlobalVariableScope |
	#ProjectScope |
	#RoleScope |
	#RoleBindingScope |
	#SecretScope |
	#UserScope |
	#VariableScope |
	#WildcardScope

#DashboardScope:          #Scope & "Dashboard"
#DatasourceScope:         #Scope & "Datasource"
#EphemeralDashboardScope: #Scope & "EphemeralDashboard"
#FolderScope:             #Scope & "Folder"
#GlobalDatasourceScope:   #Scope & "GlobalDatasource"
#GlobalRoleScope:         #Scope & "GlobalRole"
#GlobalRoleBindingScope:  #Scope & "GlobalRoleBinding"
#GlobalSecretScope:       #Scope & "GlobalSecret"
#GlobalVariableScope:     #Scope & "GlobalVariable"
#ProjectScope:            #Scope & "Project"
#RoleScope:               #Scope & "Role"
#RoleBindingScope:        #Scope & "RoleBinding"
#SecretScope:             #Scope & "Secret"
#UserScope:               #Scope & "User"
#VariableScope:           #Scope & "Variable"
#WildcardScope:           #Scope & "*"