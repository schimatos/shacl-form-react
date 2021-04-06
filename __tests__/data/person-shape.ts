export default `@prefix dash: <http://datashapes.org/dash#> .
@prefix ex: <http://datashapes.org/sh/tests/core/complex/personexample.test#> .
@prefix mf: <http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix sht: <http://www.w3.org/ns/shacl-test#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/>.

ex:Alice
  rdf:type ex:Person ;
  ex:ssn "987-65-432A" ;
.
ex:Bob
  rdf:type ex:Person ;
  ex:ssn "123-45-6789" ;
  ex:ssn "124-35-6789" ;
.
ex:Calvin
  rdf:type ex:Person ;
  ex:birthDate "1999-09-09"^^xsd:date ;
  ex:worksFor ex:UntypedCompany ;
.
ex:PersonShape
  rdf:type sh:NodeShape ;
  sh:closed "true"^^xsd:boolean ;
  sh:ignoredProperties (
      rdf:type
    ) ;
  sh:property _:b61064 ;
  sh:property _:b60054 ;
  sh:property [
    sh:path (ex:1 ex:2 ex:3) ;
    sh:name "random path" ;
  ] ;
  sh:property [
    sh:path [ sh:zeroOrMorePath (ex:1 ex:2 ex:3) ] ;
    sh:name "employee" ;
  ] ;
  sh:property [
    sh:path [
      sh:alternativePath (
        [sh:zeroOrMorePath (foaf:knows)]
        [sh:zeroOrMorePath (foaf:name)]
      )
    ] ;
    sh:name "friend" ;
  ] ;
  sh:property [
      sh:path [
          sh:inversePath ex:worksFor ;
        ] ;
      sh:name "employee" ;
    ] ;
  sh:targetClass ex:Person ;
.
_:b61064
 sh:path ex:ssn ;
 sh:datatype xsd:string ;
 sh:maxCount 1
.
_:b60054
 sh:path ex:worksFor ;
 sh:class ex:Company ;
 sh:nodeKind sh:IRI
.
<>
  rdf:type mf:Manifest ;
  mf:entries (
      <personexample>
    ) ;
.
<personexample>
  rdf:type sht:Validate ;
  rdfs:label "Test of personexample" ;
  mf:action [
      sht:dataGraph <> ;
      sht:shapesGraph <> ;
    ] ;
  mf:result [
      rdf:type sh:ValidationReport ;
      sh:conforms "false"^^xsd:boolean ;
      sh:result [
          rdf:type sh:ValidationResult ;
          sh:focusNode ex:Alice ;
          sh:resultPath ex:ssn ;
          sh:resultSeverity sh:Violation ;
          sh:sourceConstraintComponent sh:PatternConstraintComponent ;
          sh:sourceShape _:b61064 ;
          sh:value "987-65-432A" ;
        ] ;
      sh:result [
          rdf:type sh:ValidationResult ;
          sh:focusNode ex:Bob ;
          sh:resultPath ex:ssn ;
          sh:resultSeverity sh:Violation ;
          sh:sourceConstraintComponent sh:MaxCountConstraintComponent ;
          sh:sourceShape _:b61064 ;
        ] ;
      sh:result [
          rdf:type sh:ValidationResult ;
          sh:focusNode ex:Calvin ;
          sh:resultPath ex:birthDate ;
          sh:resultSeverity sh:Violation ;
          sh:sourceConstraintComponent sh:ClosedConstraintComponent ;
          sh:sourceShape ex:PersonShape ;
          sh:value "1999-09-09"^^xsd:date ;
        ] ;
      sh:result [
          rdf:type sh:ValidationResult ;
          sh:focusNode ex:Calvin ;
          sh:resultPath ex:worksFor ;
          sh:resultSeverity sh:Violation ;
          sh:sourceConstraintComponent sh:ClassConstraintComponent ;
          sh:sourceShape _:b60054 ;
          sh:value ex:UntypedCompany ;
        ] ;
    ] ;
  mf:status sht:approved ;
.`;
